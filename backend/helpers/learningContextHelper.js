/**
 * Learning Context Helper
 * Fetches lecture content, documents, and student performance data
 * for RAG-based AI tutoring system
 */

const Subject = require("../models/subjectSchema");
const Student = require("../models/studentSchema");
const mongoose = require("mongoose");

/**
 * Detect subject from chat context
 * Smart detection based on recent message history and student enrollment
 *
 * @param {string} studentId - Student ID
 * @param {array} chatHistory - Recent chat messages
 * @param {string} currentMessage - Current message from student
 * @returns {Promise<object>} { subjectId, subjectName, confidence }
 */
async function detectSubjectContext(studentId, chatHistory = [], currentMessage = "") {
  try {
    const student = await Student.findById(studentId)
      .populate({
        path: "sclassName",
        populate: { path: "subjects" }
      });

    if (!student || !student.sclassName || !student.sclassName.subjects) {
      return { subjectId: null, subjectName: "Unknown", confidence: 0 };
    }

    // If previous messages in chat have subject context, use that
    if (chatHistory.length > 0) {
      // Look for subject mentions in recent history
      for (const msg of chatHistory.slice(-5)) {
        if (msg.subjectId) {
          const subject = await Subject.findById(msg.subjectId);
          return {
            subjectId: msg.subjectId.toString(),
            subjectName: subject?.subjectName || "Unknown",
            confidence: 0.95,
          };
        }
      }
    }

    // Try to infer from message keywords (simple heuristic)
    const message = currentMessage.toLowerCase();
    const subjects = student.sclassName.subjects;

    for (const subj of subjects) {
      const keywords = (subj.subjectName || "").toLowerCase().split("|");
      for (const keyword of keywords) {
        if (message.includes(keyword.trim())) {
          return {
            subjectId: subj._id.toString(),
            subjectName: subj.subjectName,
            confidence: 0.8,
          };
        }
      }
    }

    // Default to first subject if no context found
    if (subjects.length > 0) {
      return {
        subjectId: subjects[0]._id.toString(),
        subjectName: subjects[0].subjectName,
        confidence: 0.3,
      };
    }

    return { subjectId: null, subjectName: "Unknown", confidence: 0 };
  } catch (error) {
    console.error("Error detecting subject context:", error);
    return { subjectId: null, subjectName: "Unknown", confidence: 0, error };
  }
}

/**
 * Get recent lecture content for a subject
 * Used as context for RAG system
 *
 * @param {string} subjectId
 * @param {number} limit - Number of recent lectures to fetch
 * @returns {Promise<array>} Array of lecture objects with content
 */
async function getRecentLectures(subjectId, limit = 5) {
  try {
    // Note: This assumes you have a Lecture model
    // If not, we'll fetch from a lectures collection
    const db = mongoose.connection.db;

    if (!db || !db.collection) {
      console.warn("Database connection not available for lectures");
      return [];
    }

    const lectures = await db.collection("lectures").findMany(
      { subject: mongoose.Types.ObjectId(subjectId) },
      {
        sort: { createdAt: -1 },
        limit: limit,
        projection: { title: 1, content: 1, createdAt: 1, _id: 1 },
      }
    );

    return lectures || [];
  } catch (error) {
    console.warn("Could not fetch lectures:", error.message);
    // Gracefully degrade - return empty array instead of failing
    return [];
  }
}

/**
 * Get student's learning performance metrics
 * Used to personalize AI responses and generate insights
 *
 * @param {string} studentId
 * @param {string} subjectId
 * @returns {Promise<object>} Performance metrics
 */
async function getStudentPerformance(studentId, subjectId) {
  try {
    const student = await Student.findById(studentId);
    if (!student) return null;

    // Find exam result for this subject
    const examResult = student.examResult.find(
      (e) => e.subName.toString() === subjectId
    );

    // Calculate attendance for this subject
    const subjectAttendance = student.attendance.filter(
      (a) => a.subName.toString() === subjectId
    );
    const presentDays = subjectAttendance.filter(
      (a) => a.status === "Present"
    ).length;
    const attendanceRate =
      subjectAttendance.length > 0
        ? Math.round((presentDays / subjectAttendance.length) * 100)
        : 0;

    return {
      avgScore: examResult?.marksObtained || 0,
      attendanceRate,
      totalAttendanceDays: subjectAttendance.length,
      presentDays,
      rollNum: student.rollNum,
      name: student.name,
    };
  } catch (error) {
    console.error("Error fetching student performance:", error);
    return null;
  }
}

/**
 * Get quiz attempt history to identify weak topics
 * Used for personalized insights
 *
 * @param {string} studentId
 * @param {string} subjectId
 * @param {number} limit
 * @returns {Promise<array>} Recent quiz attempts
 */
async function getQuizAttempts(studentId, subjectId, limit = 10) {
  try {
    const db = mongoose.connection.db;

    if (!db || !db.collection) {
      console.warn("Database connection not available for quiz attempts");
      return [];
    }

    const quizzes = await db.collection("quizAttempts").findMany(
      {
        student: mongoose.Types.ObjectId(studentId),
        subject: mongoose.Types.ObjectId(subjectId),
      },
      {
        sort: { attemptedAt: -1 },
        limit: limit,
        projection: { score: 1, totalScore: 1, topicsAttempted: 1, attemptedAt: 1 },
      }
    );

    return quizzes || [];
  } catch (error) {
    console.warn("Could not fetch quiz attempts:", error.message);
    return [];
  }
}

/**
 * Build RAG context window from lectures and documents
 * This is the "retrieval" part of RAG
 *
 * @param {string} subjectId
 * @param {string} question - Student question (used to find relevant sections)
 * @returns {Promise<object>} Context with lectures, documents, and relevance scores
 */
async function buildContextWindow(subjectId, question = "") {
  try {
    const lectures = await getRecentLectures(subjectId, 10); // Get more for better matching

    // Simplefiltering based on keywords in question
    // In production, you'd use semantic search (embeddings)
    let relevantLectures = lectures;

    if (question) {
      const keywords = question.toLowerCase().split(" ");
      relevantLectures = lectures.filter((lecture) => {
        const lectureText = (
          (lecture.title || "") +
          " " +
          (lecture.content || "")
        ).toLowerCase();
        return keywords.some((keyword) => lectureText.includes(keyword));
      });
    }

    // Fall back to most recent lectures if no keyword match
    if (relevantLectures.length === 0) {
      relevantLectures = lectures.slice(0, 3);
    }

    return {
      lectures: relevantLectures,
      lectureCount: relevantLectures.length,
      summary: relevantLectures
        .map((l) => `[${l.title}] ${l.content?.substring(0, 200)}...`)
        .join("\n"),
    };
  } catch (error) {
    console.error("Error building context window:", error);
    return {
      lectures: [],
      lectureCount: 0,
      summary: "[Context not available]",
    };
  }
}

/**
 * Format context for AI prompt
 * Prepares all gathered context for the AI service
 *
 * @param {string} question
 * @param {object} performance
 * @param {object} contextWindow
 * @returns {string} Formatted context string
 */
function formatContextForAI(question, performance, contextWindow) {
  let contextStr = "---LEARNING CONTEXT---\n";

  if (performance) {
    contextStr += `📊 Student Performance:\n`;
    contextStr += `- Average Score: ${performance.avgScore}/100\n`;
    contextStr += `- Attendance: ${performance.attendanceRate}%\n`;
    contextStr += `- Student: ${performance.name} (Roll: ${performance.rollNum})\n\n`;
  }

  if (contextWindow && contextWindow.lectureCount > 0) {
    contextStr += `📚 Relevant Lecture Materials:\n`;
    contextStr += contextWindow.summary;
    contextStr += `\n\n`;
  }

  contextStr += `❓ Student Question: ${question}\n`;
  contextStr += "---END CONTEXT---\n";

  return contextStr;
}

module.exports = {
  detectSubjectContext,
  getRecentLectures,
  getStudentPerformance,
  getQuizAttempts,
  buildContextWindow,
  formatContextForAI,
};
