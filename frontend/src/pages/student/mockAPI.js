/**
 * Mock API Functions for Student Chatbot Demo
 * Simulates backend API with realistic delays
 */

import {
  MOCK_AI_RESPONSES,
  MOCK_INITIAL_MESSAGES,
  MOCK_PERFORMANCE,
  MOCK_QUIZZES,
} from "./mockData.js";

/**
 * Simulate API delay (1000-1500ms)
 */
const simulateDelay = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000 + Math.random() * 500);
  });
};

/**
 * Mock: Get chat history
 */
export const mockGetChatHistory = async (studentId) => {
  await simulateDelay();
  return {
    success: true,
    userId: studentId,
    messages: MOCK_INITIAL_MESSAGES,
  };
};

/**
 * Mock: Send chat message and get AI response
 * Returns: { user, assistant, insights, sources, performance, quizzes }
 */
export const mockSendChatMessage = async (studentId, message, subjectId) => {
  await simulateDelay();

  // Select random AI response
  const aiData = MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)];

  const userMessage = {
    _id: `msg_${Date.now()}_user`,
    role: "user",
    content: message,
    subject: subjectId,
  };

  const assistantMessage = {
    _id: `msg_${Date.now()}_assistant`,
    role: "assistant",
    content: aiData.answer,
    subject: subjectId,
    sources: aiData.sources,
    metadata: {
      insightsProvided: aiData.insights,
    },
  };

  return {
    success: true,
    userId: studentId,
    subjectId: subjectId,
    user: userMessage,
    assistant: assistantMessage,
    insights: aiData.insights,
    sources: aiData.sources,
    performance: MOCK_PERFORMANCE,
    quizzes: MOCK_QUIZZES, // Return quiz suggestions
  };
};

/**
 * Mock: Generate quiz based on message
 */
export const mockGenerateQuiz = async (studentId, topic) => {
  await simulateDelay();

  return {
    success: true,
    quizId: `quiz_${Date.now()}`,
    topic: topic,
    questions: [
      {
        id: 1,
        text: "Đảng Cộng sản Việt Nam được thành lập vào năm nào?",
        options: [
          { label: "A", text: "1925" },
          { label: "B", text: "1930" },
          { label: "C", text: "1935" },
          { label: "D", text: "1940" },
        ],
        correctOption: "B",
      },
      {
        id: 2,
        text: "Ai là khởi sáng viên Đảng Cộng sản Việt Nam?",
        options: [
          { label: "A", text: "Phạm Văn Đồng" },
          { label: "B", text: "Võ Nguyên Giáp" },
          { label: "C", text: "Hồ Chí Minh" },
          { label: "D", text: "Lê Duẩn" },
        ],
        correctOption: "C",
      },
    ],
  };
};

/**
 * Mock: Get quiz details
 */
export const mockGetQuizDetail = async (quizId) => {
  await simulateDelay();

  return {
    success: true,
    _id: quizId,
    title: "Kiểm tra Lịch sử Đảng - Cơ bản",
    description: "10 câu hỏi trắc nghiệm về thành lập Đảng",
    difficulty: "easy",
    timeLimit: 30,
    totalQuestions: 10,
    passingScore: 60,
  };
};

/**
 * Mock: Submit quiz attempt
 */
export const mockSubmitQuizAttempt = async (studentId, quizId, answers) => {
  await simulateDelay();

  // Calculate score (simple logic: random between 60-95)
  const score = Math.floor(Math.random() * 35) + 60;
  const isPassed = score >= 60;

  return {
    success: true,
    quizId: quizId,
    studentId: studentId,
    score: score,
    percentage: score,
    isPassed: isPassed,
    message: isPassed 
      ? `🎉 Chúc mừng! Bạn đạt ${score}%` 
      : `Bạn chưa đạt. Điểm: ${score}%. Hãy ôn tập lại và thử lại!`,
  };
};

/**
 * Export all mock functions
 */
export const mockAPI = {
  getChatHistory: mockGetChatHistory,
  sendChatMessage: mockSendChatMessage,
  generateQuiz: mockGenerateQuiz,
  getQuizDetail: mockGetQuizDetail,
  submitQuizAttempt: mockSubmitQuizAttempt,
};
