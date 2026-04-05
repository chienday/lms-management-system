/**
 * Mock Data for Student Chatbot Demo
 * Used for UI/UX testing before backend integration
 */

export const MOCK_SUBJECTS = [
  {
    _id: "subject_1",
    subjectName: "Lịch sử Đảng",
    code: "64KTPM3",
    class: "KTPM3"
  },
  {
    _id: "subject_2",
    subjectName: "Lịch sử Đảng",
    code: "64KTPM4",
    class: "KTPM4"
  },
  {
    _id: "subject_3",
    subjectName: "Toán cao cấp",
    code: "64KTPM3",
    class: "KTPM3"
  },
  {
    _id: "subject_4",
    subjectName: "Lập trình Web",
    code: "64KTPM4",
    class: "KTPM4"
  }
];

export const MOCK_INITIAL_MESSAGES = [
  {
    _id: "msg_1",
    role: "assistant",
    content: "Xin chào! 👋 Tôi là trợ lý học tập AI của bạn. Tôi có thể giúp bạn:\n\n✅ Giải thích kiến thức môn học\n✅ Trả lời câu hỏi\n✅ Gợi ý cách học hiệu quả\n✅ Tạo quiz ôn tập\n\nHãy bắt đầu bằng cách đặt một câu hỏi! 🚀"
  }
];

export const MOCK_AI_RESPONSES = [
  {
    answer: "Lịch sử Đảng Cộng sản Việt Nam là một chủ đề quan trọng. Đảng được thành lập ngày 3 tháng 2 năm 1930 tại Hồng Kông. Đây là một mốc son quan trọng trong lịch sử cách mạng Việt Nam.\n\n🎯 Những điểm chính cần nhớ:\n• Thời gian thành lập: 3/2/1930\n• Địa điểm: Hồng Kông\n• Nhân vật chủ chốt: Hồ Chí Minh\n• Ý nghĩa: Bước ngoặt trong cách mạng Việt Nam",
    insights: [
      {
        topic: "Thời gian",
        suggestion: "Hãy luyện tập nhớ các ngày tháng năm quan trọng trong lịch sử",
        severity: "medium"
      },
      {
        topic: "Nhân vật lịch sử",
        suggestion: "Nên tìm hiểu kỹ hơn về vai trò của Hồ Chí Minh trong Cách mạng Tháng Tám",
        severity: "high"
      }
    ],
    sources: [
      { _id: "src_1", title: "Bài giảng 1: Thành lập Đảng" },
      { _id: "src_2", title: "Tài liệu: Lịch sử Đảng từ 1930-1945" }
    ]
  },
  {
    answer: "Hồ Chí Minh (1890-1969) là người sáng lập Đảng Cộng sản Việt Nam và Chủ tịch nước Việt Nam Dân chủ Cộng hòa. Ông có vai trò cực kỳ quan trọng trong cách mạng Việt Nam.\n\n📚 Sự nghiệp chính:\n• 1911: Rời Việt Nam để tìm đường cứu nước\n• 1920: Tham gia Đại hội Đảng Cộng sản Pháp\n• 1930: Trở lại Việt Nam, thành lập Đảng\n• 1945: Lãnh đạo Cách mạng Tháng Tám",
    insights: [
      {
        topic: "Tiểu sử nhân vật",
        suggestion: "Hãy nắm vững các giai đoạn chính của cuộc đời Hồ Chí Minh",
        severity: "high"
      },
      {
        topic: "Cách mạng Tháng Tám",
        suggestion: "Xem lại những sự kiện quan trọng dẫn đến thành công của Cách mạng",
        severity: "low"
      }
    ],
    sources: [
      { _id: "src_3", title: "Bài 2: Tiểu sử Hồ Chí Minh" },
      { _id: "src_4", title: "Cách mạng Tháng Tám 1945" }
    ]
  },
  {
    answer: "Cách mạng Tháng Tám năm 1945 là sự kiện lịch sử quan trọng trong lịch sử Việt Nam, đánh dấu sự thành lập Nước Việt Nam Dân chủ Cộng hòa.\n\n🎪 Sự kiện chính:\n• Bắt đầu: Tháng 8/1945\n• Kết quả: Lật đổ chế độ thực dân Pháp\n• Thành lập: Chính phủ lâm thời do Hồ Chí Minh đứng đầu\n• Ý nghĩa: Độc lập Việt Nam",
    insights: [
      {
        topic: "Sự kiện lịch sử",
        suggestion: "Cần ghi nhớ tên gọi chính xác: 'Cách mạng Tháng Tám'",
        severity: "medium"
      },
      {
        topic: "Bối cảnh lịch sử",
        suggestion: "Tìm hiểu thêm về bối cảnh Thế chiến II khi Cách mạng xảy ra",
        severity: "low"
      }
    ],
    sources: [
      { _id: "src_5", title: "Chương 3: Cách mạng Tháng Tám" },
      { _id: "src_6", title: "Giáo trình: Cách mạng Việt Nam (1945-1975)" }
    ]
  },
  {
    answer: "Điều Hành Cộng hòa Xã hội Chủ nghĩa Việt Nam là hiến pháp cơ bản của Việt Nam sau năm 1975. Nó khẳng định chế độ xã hội chủ nghĩa của Việt Nam.\n\n⚖️ Nội dung chính:\n• Công nhân là lớp lãnh đạo\n• Liên minh công nhân - nông dân - trí thức\n• Nhà nước là nhà nước của nhân dân, do nhân dân, vì nhân dân\n• Đảng Cộng sản Việt Nam là lực lượng lãnh đạo",
    insights: [
      {
        topic: "Hiến pháp",
        suggestion: "Nên so sánh với các hiến pháp khác để hiểu rõ hơn",
        severity: "low"
      },
      {
        topic: "Chế độ chính trị",
        suggestion: "Ôn tập lý thuyết xã hội chủ nghĩa để nắm vững bối cảnh",
        severity: "high"
      }
    ],
    sources: [
      { _id: "src_7", title: "Hiến pháp Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam" },
      { _id: "src_8", title: "Ôn tập: Chế độ chính trị Việt Nam" }
    ]
  }
];

export const MOCK_QUICK_ACTIONS = [
  {
    id: 1,
    label: "Giải thích lại",
    icon: "🔄",
    message: "Bạn có thể giải thích lại chi tiết hơn không?"
  },
  {
    id: 2,
    label: "Tạo quiz",
    icon: "📝",
    message: "Hãy tạo một bộ câu hỏi trắc nghiệm để tôi ôn tập"
  },
  {
    id: 3,
    label: "Ôn tập",
    icon: "📚",
    message: "Hãy giúp tôi tóm tắt lại nội dung chính của bài học"
  },
  {
    id: 4,
    label: "Ví dụ thực tế",
    icon: "💡",
    message: "Bạn có thể cho một ví dụ thực tế để tôi dễ hiểu hơn?"
  }
];

export const MOCK_PERFORMANCE = {
  avgScore: 7.5,
};

export const MOCK_QUIZZES = {
  suggestions: [
    {
      _id: "quiz_1",
      title: "Kiểm tra Lịch sử Đảng - Cơ bản",
      description: "10 câu hỏi trắc nghiệm về thành lập Đảng",
      difficulty: "easy",
      averageScore: 72,
      attemptCount: 5
    },
    {
      _id: "quiz_2",
      title: "Lịch Sử Đảng - Nâng cao",
      description: "15 câu hỏi về Cách mạng Tháng Tám",
      difficulty: "medium",
      averageScore: 68,
      attemptCount: 3
    },
    {
      _id: "quiz_3",
      title: "Tổng hợp Lịch Sử Đảng",
      description: "20 câu hỏi kết hợp tất cả chủ đề",
      difficulty: "hard",
      averageScore: 65,
      attemptCount: 1
    }
  ],
  performance: {
    attemptedQuizzes: 3,
    averageScore: 68,
    passRate: 75,
    suggestedDifficulty: "medium",
  },
  recentAttempts: [
    {
      quizTitle: "Kiểm tra Lịch sử Đảng - Cơ bản",
      score: 80,
      passed: true,
      completedAt: new Date(Date.now() - 2*24*60*60*1000)
    },
    {
      quizTitle: "Lịch Sử Đảng - Nâng cao",
      score: 65,
      passed: false,
      completedAt: new Date(Date.now() - 5*24*60*60*1000)
    }
  ]
};
