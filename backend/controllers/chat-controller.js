const Student = require("../models/studentSchema.js");
const Teacher = require("../models/teacherSchema.js");
const ChatMessage = require("../models/chatMessageSchema.js");
const {
  detectSubjectContext,
  getStudentPerformance,
  buildContextWindow,
  formatContextForAI,
} = require("../helpers/learningContextHelper.js");
const {
  suggestQuizzes,
  getRecentQuizAttempts,
} = require("../helpers/quizSuggestionHelper.js");

// Keep history bounded to avoid huge prompts
const MAX_HISTORY_MESSAGES = 20;

// Helper to get AI service URL
const getAIServiceUrl = (endpoint = "/chat") => {
  const baseUrl = process.env.AI_SERVICE_URL || "http://ai-service:8000";
  return `${baseUrl}${endpoint}`;
};

/**
 * GET /Chat/History/:userId?subjectId=xxx
 * Returns recent chat history for a student or teacher.
 * Optionally filtered by subject.
 * 
 * Enhanced:
 * - Filter by subject if provided
 * - Include metadata and insights
 * - Organize by subject context
 */
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subjectId } = req.query;

    // Try to find as student first, then as teacher
    let student = await Student.findById(userId).select("_id");
    let teacher = await Teacher.findById(userId).select("_id");

    if (!student && !teacher) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query
    const query = student ? { student: userId } : { teacher: userId };
    if (subjectId) {
      query.subject = subjectId;
    }

    // Fetch messages with full metadata
    const messages = await ChatMessage.find(query)
      .populate("subject", "subjectName")
      .sort({ createdAt: 1 })
      .limit(200);

    // Group by subject if not filtered
    let response = { userId, messages };
    if (!subjectId && messages.length > 0) {
      const grouped = {};
      messages.forEach((msg) => {
        const key = msg.subject?._id || "unassigned";
        if (!grouped[key]) {
          grouped[key] = {
            subjectId: key,
            subjectName: msg.subject?.subjectName || "Unassigned",
            messages: [],
          };
        }
        grouped[key].messages.push(msg);
      });
      response.bySubject = Object.values(grouped);
    }

    return res.send(response);
  } catch (error) {
    console.error("Error getting chat history:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /Chat/Send
 * Body: { studentId OR teacherId, message, subjectId (optional) }
 * 
 * Enhanced with:
 * - Subject context detection
 * - RAG context gathering (lectures, documents)
 * - Student performance data
 * - Source attribution for responses
 */
const sendChatMessage = async (req, res) => {
  try {
    const { studentId, teacherId, message, subjectId } = req.body || {};
    const userId = studentId || teacherId;

    if (!userId || !message) {
      return res.status(400).json({ message: "userId (studentId or teacherId) and message are required" });
    }

    // Verify user exists (student or teacher)
    let student = null;
    let teacher = null;
    let userIdentifier = null;
    let detectedSubjectId = subjectId; // Use provided subject or detect it

    if (studentId) {
      student = await Student.findById(studentId).select("_id name rollNum");
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      userIdentifier = { student: studentId };

      // For students: detect subject context if not provided
      if (!detectedSubjectId) {
        const recentMessages = await ChatMessage.find({ student: studentId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("subject");

        const { subjectId: detected } = await detectSubjectContext(
          studentId,
          recentMessages,
          message
        );
        detectedSubjectId = detected;
      }
    } else if (teacherId) {
      teacher = await Teacher.findById(teacherId).select("_id name");
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      userIdentifier = { teacher: teacherId };
    }

    // Save user message with subject context
    const userMsg = await ChatMessage.create({
      ...userIdentifier,
      role: "user",
      content: message,
      subject: detectedSubjectId || undefined, // Add subject to message
    });

    // Load recent history for context
    const query = studentId ? { student: studentId } : { teacher: teacherId };
    const recent = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY_MESSAGES);

    const chronological = recent.reverse();
    const history = chronological.map((m) => ({
      role: m.role,
      content: m.content,
      subject: m.subject?.toString(),
    }));

    // ========== ENHANCED: Build RAG context ==========
    let contextWindow = null;
    let studentPerformance = null;
    let ragContext = "";

    if (studentId && detectedSubjectId) {
      try {
        // Fetch student performance metrics
        studentPerformance = await getStudentPerformance(studentId, detectedSubjectId);

        // Build context window from lectures and documents
        contextWindow = await buildContextWindow(detectedSubjectId, message);

        // Format context for AI
        ragContext = formatContextForAI(message, studentPerformance, contextWindow);

        console.log(
          `[Context] Subject: ${detectedSubjectId}, Lectures found: ${contextWindow.lectureCount}, Performance: ${studentPerformance?.avgScore || "N/A"}`
        );
      } catch (contextError) {
        console.warn("Could not build full context:", contextError.message);
        // Continue anyway with partial context
      }
    }

    // Call AI service with enhanced context
    const aiServiceUrl = getAIServiceUrl("/chat");
    const aiPayload = {
      userId: userId.toString(),
      studentId: studentId || undefined,
      subjectId: detectedSubjectId,
      question: message,
      history,
      context: ragContext,
      performance: studentPerformance,
      lectureContent: contextWindow?.summary,
    };

    console.log(`[AI Service] Calling ${aiServiceUrl} with subject=${detectedSubjectId}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for chat

    const aiResponse = await fetch(aiServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI chat service error: ${aiResponse.statusText} - ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    const reply = aiResult?.answer;
    if (!reply) {
      throw new Error("Invalid AI chat response (missing answer field)");
    }

    // ========== Save assistant message with metadata ==========
    const assistantMsg = await ChatMessage.create({
      ...userIdentifier,
      role: "assistant",
      content: reply,
      subject: detectedSubjectId || undefined,
      sources: aiResult?.sources || [],
      metadata: {
        lectureIds: contextWindow?.lectures?.map((l) => l._id) || [],
        insightsProvided: aiResult?.insights || [],
      },
    });

    // ========== Get quiz suggestions for this subject ==========
    let quizData = { suggestions: [], performance: null, recentAttempts: [] };
    if (studentId && detectedSubjectId) {
      try {
        const quizResult = await suggestQuizzes(studentId, detectedSubjectId, message);
        const recentAttempts = await getRecentQuizAttempts(studentId, detectedSubjectId, 3);
        
        quizData = {
          suggestions: quizResult.suggestions,
          performance: quizResult.performance,
          recentAttempts: recentAttempts,
        };
      } catch (quizError) {
        console.warn("Could not fetch quiz suggestions:", quizError.message);
        // Continue without quiz data
      }
    }

    // Return response with subject, insights, sources, and quiz suggestions
    return res.send({
      userId,
      subjectId: detectedSubjectId,
      user: userMsg,
      assistant: assistantMsg,
      insights: aiResult?.insights || [],
      sources: aiResult?.sources || [], // Source documents/lectures referenced
      performance: studentPerformance, // Student's learning data
      quizzes: quizData, // NEW: Quiz suggestions
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    if (error.name === "AbortError") {
      return res.status(503).json({ message: "AI service timeout - please try again" });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /Chat/GenerateQuiz
 * Body: { teacherId, subjectId, lectureId, questionCount }
 * Calls AI service to generate quiz questions
 */
const generateQuiz = async (req, res) => {
  try {
    const { teacherId, subjectId, lectureId, questionCount } = req.body || {};

    if (!teacherId || !subjectId || !lectureId) {
      return res.status(400).json({
        message: "teacherId, subjectId, and lectureId are required",
      });
    }

    const aiServiceUrl = getAIServiceUrl("/generate_quiz");
    const aiPayload = {
      teacherId,
      subjectId,
      lectureId,
      questionCount: questionCount || 5,
    };

    console.log(`[AI Service] Calling ${aiServiceUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    const aiResponse = await fetch(aiServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI service error: ${aiResponse.statusText} - ${errorText}`);
    }

    const result = await aiResponse.json();
    return res.send(result);
  } catch (error) {
    console.error("Error generating quiz:", error);
    if (error.name === "AbortError") {
      return res.status(503).json({ message: "AI service timeout - quiz generation took too long" });
    }
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /Chat/ClassInsights
 * Body: { teacherId, classId }
 * Calls AI service to generate class performance insights
 * With fallback response if AI service unavailable
 */
const getClassInsights = async (req, res) => {
  try {
    const { teacherId, classId } = req.body || {};

    if (!teacherId || !classId) {
      return res.status(400).json({
        message: "teacherId and classId are required",
      });
    }

    const aiServiceUrl = getAIServiceUrl("/insights");
    const aiPayload = {
      teacherId,
      classId,
    };

    console.log(`[AI Service] Calling ${aiServiceUrl}`, aiPayload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const aiResponse = await fetch(aiServiceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        throw new Error(`AI service error: ${aiResponse.statusText} - ${errorText}`);
      }

      const result = await aiResponse.json();
      return res.send(result);
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        console.warn(`[AI Service] Request timeout after 60 seconds to ${aiServiceUrl}`);
        // Return fallback response instead of error
        return res.status(200).json({
          insights: [],
          warning: "AI service is currently unavailable. Insights could not be generated. Please try again later.",
        });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error getting class insights:", error);
    // Return 503 Service Unavailable instead of 500
    return res.status(503).json({
      message: "AI service is currently unavailable",
      details: error.message,
      insights: [],
    });
  }
};

module.exports = { getChatHistory, sendChatMessage, generateQuiz, getClassInsights };

