// Chatbot data với key-value matching cho triết học, chính trị và phân tích học tập sinh viên
export const CHATBOT_DATA = {
  // Chào hỏi và giới thiệu
  greetings: [
    { 
      keywords: ['chào', 'hello', 'hi', 'xin chào', 'chào bot'], 
      response: 'Chào bạn! Tôi là trợ lý AI phân tích học tập. Tôi có thể giúp bạn phân tích tiến độ học tập, đưa ra khuyến nghị và giải đáp thắc mắc về học tập. Bạn muốn hỏi gì?' 
    },
    { 
      keywords: ['tạm biệt', 'bye', 'goodbye', 'hẹn gặp lại', 'tạm biệt bot'], 
      response: 'Tạm biệt! Hẹn gặp lại bạn lần sau. Chúc bạn học tập tốt và đạt kết quả cao!' 
    },
    {
      keywords: ['cảm ơn', 'thank', 'thanks', 'cảm ơn bot'],
      response: 'Không có gì! Tôi rất vui được giúp bạn. Nếu có thêm câu hỏi nào, hãy cứ hỏi nhé!'
    },
    {
      keywords: ['bạn là ai', 'ai là bạn', 'tên bạn là gì', 'giới thiệu về bạn'],
      response: 'Tôi là AI Assistant - Trợ lý phân tích học tập thông minh. Tôi có thể phân tích điểm số, điểm danh, tần suất truy cập và đưa ra khuyến nghị cải thiện học tập cho bạn.'
    }
  ],

  
  // Phân tích chi tiết các môn học/chương
  detailed_analysis: [
    {
      keywords: ['chương 1', 'chương một', 'giá trị thặng dư', 'quy luật giá trị'],
      response: '📘 **Chương 1: Giá trị thặng dư và quy luật giá trị**\n• Kiến thức trọng tâm: Lao động tạo giá trị, giá trị thặng dư\n• Cách học hiệu quả: Liên hệ thực tế, ví dụ cụ thể\n• Nếu điểm thấp: Ôn lại khái niệm cơ bản, làm bài tập vận dụng'
    },
    {
      keywords: ['chương 2', 'chương hai', 'biện chứng duy vật', 'chủ nghĩa xã hội khoa học'],
      response: '📙 **Chương 2: Biện chứng duy vật và CNXH khoa học**\n• Kiến thức trọng tâm: Phép biện chứng, mâu thuẫn giai cấp\n• Cách học hiệu quả: Học theo sơ đồ tư duy\n• Nếu điểm thấp: Tập trung vào các nguyên lý cơ bản'
    },
    {
      keywords: ['chương 3', 'chương ba', 'dân chủ', 'quyền con người', 'nhân quyền'],
      response: '📗 **Chương 3: Dân chủ và quyền con người**\n• Kiến thức trọng tâm: Các hình thức dân chủ, thế hệ quyền\n• Cách học hiệu quả: So sánh các mô hình\n• Nếu điểm thấp: Học thuộc khái niệm, liên hệ thực tế'
    },
    {
      keywords: ['môn học', 'môn chính trị', 'lý luận chính trị', 'triết học'],
      response: '🏛️ **Môn Lý luận chính trị**\n• Đặc điểm: Lý thuyết trừu tượng, cần tư duy logic\n• Mẹo học: Đọc trước bài, tham gia thảo luận, liên hệ thực tế\n• Tài liệu hỗ trợ: Sách giáo trình, bài giảng online, nhóm học tập'
    }
  ],

  // Kế hoạch và phương pháp học tập
  study_plan: [
    {
      keywords: ['kế hoạch học', 'lịch học', 'thời gian biểu', 'sắp xếp thời gian'],
      response: '⏰ **Xây dựng kế hoạch học tập:**\n1. Dành 2-3 giờ/ngày cho môn chính trị\n2. Ôn tập sau mỗi buổi học\n3. Làm bài tập ngay khi có thể\n4. Chuẩn bị bài trước khi đến lớp\n5. Dành 1 ngày/tuần tổng ôn'
    },
    {
      keywords: ['phương pháp học', 'cách học hiệu quả', 'học như thế nào', 'bí quyết học'],
      response: '🎯 **Phương pháp học hiệu quả:**\n• SQ3R: Survey, Question, Read, Recite, Review\n• Pomodoro: Học 25 phút, nghỉ 5 phút\n• Feynman: Giải thích cho người khác hiểu\n• Mind map: Sơ đồ hóa kiến thức\n• Học nhóm: Thảo luận cùng bạn bè'
    },
    {
      keywords: ['ôn thi', 'chuẩn bị thi', 'trước khi thi', 'học thi'],
      response: '📚 **Ôn thi hiệu quả:**\n• Bắt đầu ôn sớm (ít nhất 2 tuần trước thi)\n• Tập trung vào trọng tâm giáo viên nhấn mạnh\n• Làm đề thi các năm trước\n• Học nhóm để trao đổi kiến thức\n• Ngủ đủ giấc, ăn uống đầy đủ'
    },
    {
      keywords: ['quản lý thời gian', 'trì hoãn', 'lười học', 'không tập trung'],
      response: '⚡ **Khắc phục trì hoãn:**\n1. Chia nhỏ công việc\n2. Đặt deadline cụ thể\n3. Loại bỏ yếu tố gây xao nhãng\n4. Tự thưởng khi hoàn thành\n5. Tìm bạn học cùng để có động lực'
    }
  ],

  // Hỗ trợ tài liệu và công cụ
  resources_support: [
    {
      keywords: ['tài liệu', 'sách', 'bài giảng', 'giáo trình', 'tài liệu học'],
      response: '📖 **Tài liệu học tập:**\n• Giáo trình chính thức\n• Bài giảng PowerPoint\n• Video bài giảng online\n• Sách tham khảo\n• Tóm tắt kiến thức\n• Đề thi mẫu\nHãy truy cập thư viện số để tải tài liệu!'
    },
    {
      keywords: ['công cụ học', 'ứng dụng học', 'phần mềm', 'app học tập'],
      response: '🛠️ **Công cụ hỗ trợ học tập:**\n• Notion/OneNote: Ghi chú\n• Anki: Flashcard\n• Quizlet: Ôn tập\n• Forest: Tập trung\n• Google Calendar: Lên lịch\n• Zotero: Quản lý tài liệu'
    },
    {
      keywords: ['nhóm học', 'học nhóm', 'bạn học', 'thảo luận nhóm'],
      response: '👥 **Học nhóm hiệu quả:**\n• Nhóm 3-5 người là tốt nhất\n• Phân công nhiệm vụ rõ ràng\n• Đặt mục tiêu mỗi buổi học\n• Thảo luận sôi nổi nhưng có trọng tâm\n• Tổng kết sau mỗi buổi học'
    },
    {
      keywords: ['hỏi giáo viên', 'liên hệ giảng viên', 'gặp thầy cô', 'xin trợ giúp'],
      response: '👨‍🏫 **Liên hệ với giáo viên:**\n• Chuẩn bị câu hỏi cụ thể trước khi gặp\n• Gửi email lịch sự\n• Tham gia giờ hỗ trợ (office hours)\n• Mạnh dạn đặt câu hỏi trong lớp\n• Ghi chú lại lời khuyên của thầy cô'
    }
  ],

  // Đánh giá và tự đánh giá
  self_assessment: [
    {
      keywords: ['tự đánh giá', 'đánh giá bản thân', 'mình học thế nào', 'tự nhận xét'],
      response: '🪞 **Tự đánh giá học tập:**\n1. Điểm mạnh của bạn là gì?\n2. Điểm yếu cần cải thiện?\n3. Bạn dành bao nhiêu thời gian học?\n4. Phương pháp học có hiệu quả không?\n5. Mục tiêu học tập của bạn?'
    },
    {
      keywords: ['mục tiêu', 'đặt mục tiêu', 'mục tiêu học tập', 'muốn đạt điểm'],
      response: '🎯 **Đặt mục tiêu SMART:**\n• Specific: Cụ thể (VD: đạt 8 điểm chương 1)\n• Measurable: Đo lường được\n• Achievable: Khả thi\n• Relevant: Liên quan đến mục tiêu lớn\n• Time-bound: Có thời hạn'
    },
    {
      keywords: ['tiến bộ', 'cải thiện', 'phát triển', 'tăng điểm'],
      response: '📈 **Theo dõi tiến bộ:**\n• Ghi nhật ký học tập\n• So sánh điểm số qua các bài kiểm tra\n• Đánh giá định kỳ mỗi tháng\n• Điều chỉnh phương pháp khi cần\n• Ăn mừng những tiến bộ nhỏ'
    },
    {
      keywords: ['động lực', 'hứng thú học', 'không có động lực', 'chán học'],
      response: '💪 **Tạo động lực học tập:**\n• Tìm lý do tại sao bạn học môn này\n• Đặt phần thưởng nhỏ khi hoàn thành mục tiêu\n• Học cùng người có cùng mục tiêu\n• Nhìn lại những thành tích đã đạt được\n• Tưởng tượng thành công trong tương lai'
    }
  ],

  // Sức khỏe và tâm lý học tập
  health_wellness: [
    {
      keywords: ['sức khỏe', 'sức khỏe học tập', 'mệt mỏi', 'căng thẳng'],
      response: '🏥 **Sức khỏe học tập:**\n• Ngủ đủ 7-8 giờ/đêm\n• Ăn uống đầy đủ chất\n• Tập thể dục 30 phút/ngày\n• Nghỉ giải lao khi học\n• Tránh học quá khuya\n• Uống đủ nước'
    },
    {
      keywords: ['stress', 'căng thẳng', 'áp lực', 'lo lắng'],
      response: '😌 **Quản lý căng thẳng:**\n• Hít thở sâu khi căng thẳng\n• Chia sẻ với bạn bè, gia đình\n• Nghe nhạc thư giãn\n• Thiền hoặc yoga\n• Viết nhật ký cảm xúc\n• Nhận thức rằng không ai hoàn hảo'
    },
    {
      keywords: ['cân bằng', 'cân bằng cuộc sống', 'học và chơi', 'giải trí'],
      response: '⚖️ **Cân bằng học tập và cuộc sống:**\n• Lên lịch cụ thể cho học tập và giải trí\n• Dành thời gian cho sở thích cá nhân\n• Gặp gỡ bạn bè cuối tuần\n• Không học liên tục quá 2 giờ\n• Có ngày nghỉ hoàn toàn'
    },
    {
      keywords: ['ngủ', 'giấc ngủ', 'mất ngủ', 'buồn ngủ'],
      response: '😴 **Giấc ngủ quan trọng:**\n• Giấc ngủ giúp củng cố trí nhớ\n• Tránh màn hình 1 giờ trước khi ngủ\n• Tạo môi trường ngủ thoải mái\n• Đi ngủ và thức dậy cùng giờ mỗi ngày\n• Không học trên giường'
    }
  ],

  // Chủ nghĩa xã hội
  socialism: [
    {
      keywords: ['chủ nghĩa xã hội', 'socialism', 'marx', 'karl marx', 'engels'],
      response: 'Chủ nghĩa xã hội khoa học do Karl Marx và Friedrich Engels sáng lập. Marx phân tích rằng giá trị hàng hóa được tạo ra bởi lao động, và tư bản gia tăng giá trị thông qua khai thác lao động không công của công nhân (giá trị thặng dư).'
    },
    {
      keywords: ['giá trị thặng dư', 'surplus value', 'thặng dư'],
      response: 'Giá trị thặng dư là phần giá trị mà công nhân tạo ra nhưng bị tư bản gia chiếm đoạt. Công thức: Giá trị hàng hóa = Giá trị lao động + Giá trị thặng dư. Đây là cơ sở của sự bóc lột trong xã hội tư bản.'
    },
    {
      keywords: ['các giai đoạn xã hội', 'giai đoạn phát triển', 'marx giai đoạn'],
      response: 'Theo Marx, xã hội phát triển qua 5 giai đoạn: 1) Xã hội nguyên thủy (không giai cấp), 2) Xã hội nô lệ, 3) Xã hội phong kiến, 4) Xã hội tư bản (tư sản vs vô sản), 5) Xã hội cộng sản (không giai cấp, không nhà nước).'
    },
    {
      keywords: ['biện chứng duy vật', 'dialectical materialism', 'duy vật biện chứng'],
      response: 'Biện chứng duy vật của Marx phát triển từ phép biện chứng Hegel nhưng đứng trên lập trường duy vật. Động lực phát triển là mâu thuẫn giai cấp. Cách mạng là bước nhảy vọt từ thấp đến cao. Độc tài vô sản là giai đoạn chuyển tiếp.'
    }
  ],

  // Chủ nghĩa tư bản - ĐÃ THÊM ĐẦY ĐỦ
  capitalism: [
    {
      keywords: ['chủ nghĩa tư bản', 'capitalism', 'tư bản', 'weber', 'max weber'],
      response: 'Max Weber phân tích sự ra đời của tinh thần tư bản trong "Chủ nghĩa tân giáo và tinh thần tư bản". Đạo Calvin tạo ra "tinh thần tư bản" thông qua: nghề nghiệp (làm việc chăm chỉ), tiết kiệm (tích lũy của cải), và tái đầu tư (đầu tư lại lợi nhuận).'
    },
    {
      keywords: ['tinh thần tư bản', 'spirit of capitalism', 'calvin', 'tân giáo', 'tinh thần'],
      response: 'Tinh thần tư bản theo Weber bắt nguồn từ đạo Calvin: làm việc chăm chỉ là cách thể hiện lòng tin vào Chúa, tiết kiệm và tích lũy của cải nhưng không hưởng thụ, tái đầu tư lợi nhuận vào sản xuất để phát triển.'
    },
    {
      keywords: ['quyền lực weber', 'power weber', 'loại quyền lực', 'weber power'],
      response: 'Max Weber phân quyền lực thành 3 loại: 1) Quyền lực hợp pháp (dựa trên luật pháp), 2) Quyền lực truyền thống (dựa trên tập quán), 3) Quyền lực cá nhân (dựa trên sức hút cá nhân).'
    },
    {
      keywords: ['tư bản chủ nghĩa', 'capitalist', 'capitalism là gì', 'cn tư bản'],
      response: 'Chủ nghĩa tư bản là hệ thống kinh tế dựa trên sở hữu tư nhân về tư liệu sản xuất, lợi nhuận là động lực chính, và thị trường tự do phân bổ nguồn lực. Max Weber nghiên cứu về "tinh thần tư bản" từ đạo Calvin.'
    },
    {
      keywords: ['adam smith', 'bàn tay vô hình', 'thị trường tự do'],
      response: 'Adam Smith - cha đẻ kinh tế học hiện đại, đề xuất "bàn tay vô hình": khi mỗi người theo đuổi lợi ích cá nhân sẽ vô tình thúc đẩy lợi ích xã hội. Ông ủng hộ thị trường tự do và phân công lao động.'
    },
    {
      keywords: ['tư bản độc quyền', 'độc quyền', 'monopoly'],
      response: 'Tư bản độc quyền là giai đoạn phát triển cao của chủ nghĩa tư bản, khi một hoặc một vài tập đoàn chi phối toàn bộ ngành công nghiệp, loại bỏ cạnh tranh và kiểm soát giá cả.'
    }
  ],

  // Dân chủ
  democracy: [
    {
      keywords: ['dân chủ', 'democracy', 'democracy là gì', 'dân chủ là gì'],
      response: 'Dân chủ (democracy) bắt nguồn từ tiếng Hy Lạp "demos" (nhân dân) và "kratos" (quyền lực). Tại Athens thế kỷ V TCN, dân chủ trực tiếp cho phép công dân nam trưởng thành tham gia trực tiếp vào quyết định chính trị.'
    },
    {
      keywords: ['dân chủ trực tiếp', 'direct democracy'],
      response: 'Dân chủ trực tiếp: công dân trực tiếp tham gia quyết định thông qua trưng cầu dân ý. Áp dụng ở quy mô nhỏ như hội đồng địa phương. Ví dụ: Thụy Sĩ sử dụng trưng cầu dân ý thường xuyên.'
    },
    {
      keywords: ['dân chủ đại diện', 'representative democracy'],
      response: 'Dân chủ đại diện: công dân bầu ra đại biểu để thay mặt mình quyết định các vấn đề quốc gia. Đại biểu chịu trách nhiệm trước cử tri. Đây là hình thức phổ biến ở các quốc gia hiện đại.'
    },
    {
      keywords: ['dân chủ tự do', 'liberal democracy'],
      response: 'Dân chủ tự do kết hợp: 1) Dân chủ chính trị (quyền bầu cử, tự do ngôn luận), 2) Quyền tự do cá nhân (quyền sở hữu, tư pháp công bằng), 3) Quyền tự do kinh tế (quyền kinh doanh, hợp đồng).'
    }
  ],

  // Quyền con người
  human_rights: [
    {
      keywords: ['quyền con người', 'human rights', 'nhân quyền'],
      response: 'Quyền con người phát triển qua lịch sử: Tuyên ngôn độc lập Mỹ (1776), Tuyên ngôn nhân quyền Pháp (1789), Hiến chương LHQ (1945), Tuyên ngôn nhân quyền toàn cầu (1948) với 30 điều khoản.'
    },
    {
      keywords: ['thế hệ quyền', 'generations of rights', 'quyền thế hệ'],
      response: 'Quyền con người có 3 thế hệ: 1) Thế hệ 1 - Quyền tự do dân sự chính trị (quyền sống, ngôn luận, bầu cử), 2) Thế hệ 2 - Quyền kinh tế xã hội văn hóa (lao động, giáo dục, y tế), 3) Thế hệ 3 - Quyền tập thể và môi trường.'
    },
    {
      keywords: ['quyền tự do', 'freedom rights', 'quyền tự do dân sự'],
      response: 'Thế hệ 1 - Quyền tự do dân sự và chính trị: quyền sống, tự do cá nhân, ngôn luận, lập hội, bầu cử, ứng cử, tư pháp công bằng.'
    },
    {
      keywords: ['quyền kinh tế', 'economic rights', 'quyền kinh tế xã hội'],
      response: 'Thế hệ 2 - Quyền kinh tế xã hội văn hóa: quyền lao động, nghỉ ngơi, giáo dục, y tế, an ninh xã hội, hưởng thụ văn hóa.'
    }
  ],

  // Lý thuyết chính trị cơ bản
  political_theory: [
    {
      keywords: ['chính trị là gì', 'politics', 'khái niệm chính trị', 'chính trị'],
      response: 'Chính trị là hoạt động quản lý xã hội, phân bổ quyền lực và tài nguyên. Aristotle nói "con người là động vật chính trị" - có bản năng sống tập thể và tham gia hoạt động chính trị.'
    },
    {
      keywords: ['hình thức nhà nước', 'forms of government', 'quân chủ cộng hòa', 'nhà nước'],
      response: 'Các hình thức nhà nước: 1) Quân chủ (tuyệt đối/lập hiến), 2) Cộng hòa (tổng thống/nghị viện), 3) Độc tài (cá nhân/đảng phái).'
    },
    {
      keywords: ['quyền lực foucault', 'power foucault', 'michel foucault', 'foucault'],
      response: 'Michel Foucault: Quyền lực không chỉ cấm đoán mà còn sản xuất, không tập trung mà lan tỏa khắp xã hội. Quyền lực tạo ra kiến thức và chân lý.'
    },
    {
      keywords: ['hợp đồng xã hội', 'social contract', 'rousseau', 'locke'],
      response: 'Thuyết hợp đồng xã hội (Rousseau, Locke, Hobbes): Con người từ bỏ một phần tự do để hình thành xã hội có tổ chức, nhà nước bảo vệ quyền lợi chung.'
    }
  ],

  // Ứng dụng thực tế
  practical_applications: [
    {
      keywords: ['áp dụng thực tế', 'thực tế', 'cuộc sống', 'hàng ngày'],
      response: 'Lý thuyết chính trị áp dụng vào cuộc sống: Dân chủ giúp bạn bầu chọn lãnh đạo, quyền con người bảo vệ tự do cá nhân, chủ nghĩa xã hội hướng tới công bằng xã hội. Ví dụ: Khi bạn đi bầu cử, đó là thực hành dân chủ!'
    },
    {
      keywords: ['ví dụ việt nam', 'việt nam', 'đảng cộng sản', 'cộng sản việt nam'],
      response: 'Ở Việt Nam: Đảng Cộng sản lãnh đạo, nhà nước pháp quyền xã hội chủ nghĩa, kinh tế thị trường định hướng xã hội chủ nghĩa. Đây là mô hình kết hợp chủ nghĩa Marx-Lenin với thực tiễn Việt Nam.'
    },
    {
      keywords: ['bầu cử', 'đi bầu', 'quyền bầu cử'],
      response: 'Quyền bầu cử là quyền dân chủ cơ bản! Ở Việt Nam, công dân từ 18 tuổi trở lên có quyền bầu cử đại biểu Quốc hội và HĐND các cấp. Hãy tham gia để thể hiện tiếng nói của mình!'
    },
    {
      keywords: ['tự do ngôn luận', 'phát biểu', 'ý kiến'],
      response: 'Tự do ngôn luận cho phép bạn bày tỏ ý kiến, phê phán chính sách. Nhưng phải tôn trọng pháp luật và không kích động bạo lực. Đây là quyền con người thế hệ 1.'
    }
  ],

  // Câu hỏi ôn thi
  exam_questions: [
    {
      keywords: ['ôn thi', 'thi cử', 'câu hỏi thi', 'đề thi', 'thi'],
      response: 'Ôn thi lý luận chính trị: Tập trung chủ nghĩa xã hội, dân chủ, quyền con người. Hãy nhớ: Marx phân tích giá trị thặng dư, Weber nói về tinh thần tư bản, dân chủ có trực tiếp và đại diện.'
    },
    {
      keywords: ['điểm chính', 'tóm tắt', 'cần nhớ', 'trọng tâm'],
      response: 'Điểm cần nhớ: 1) Chủ nghĩa xã hội: Giá trị thặng dư, biện chứng duy vật. 2) Dân chủ: Trực tiếp vs đại diện. 3) Quyền con người: 3 thế hệ. 4) Việt Nam: ĐCSVN lãnh đạo, kinh tế thị trường định hướng XHCN.'
    },
    {
      keywords: ['ví dụ dễ nhớ', 'ghi nhớ', 'nhớ lâu'],
      response: 'Ví dụ dễ nhớ: Chủ nghĩa xã hội như "chia đều bánh" (công bằng), dân chủ như "bầu người đại diện", quyền con người như "quyền được sống tự do". Liên hệ với cuộc sống để nhớ lâu hơn!'
    }
  ],

  // Liên hệ sinh viên
  student_life: [
    {
      keywords: ['sinh viên', 'học sinh', 'trường học', 'đại học', 'sv'],
      response: 'Với sinh viên: Học lý luận chính trị giúp hiểu xã hội, phát triển tư duy phê phán. Ví dụ: Tại sao trường có hội đồng tự quản? Đó là thực hành dân chủ ở quy mô nhỏ!'
    },
    {
      keywords: ['công bằng xã hội', 'bình đẳng', 'công bằng'],
      response: 'Công bằng xã hội: Mọi người có cơ hội như nhau, không phân biệt giàu nghèo. Ở trường, học bổng cho sinh viên khó khăn là một dạng công bằng xã hội.'
    },
    {
      keywords: ['quyền lợi sinh viên', 'quyền học tập', 'quyền sinh viên'],
      response: 'Quyền lợi sinh viên: Quyền được học tập, nghiên cứu, tham gia hoạt động. Đây là quyền kinh tế xã hội văn hóa (thế hệ 2). Hãy đấu tranh cho quyền lợi chính đáng!'
    },
    {
      keywords: ['tự do học thuật', 'nghiên cứu', 'phát biểu'],
      response: 'Tự do học thuật: Sinh viên có quyền nghiên cứu, đặt câu hỏi, phê phán. Đây là nền tảng của dân chủ trong giáo dục. Đừng ngại bày tỏ ý kiến!'
    }
  ],

  // Câu hỏi thú vị
  interesting_questions: [
    {
      keywords: ['thú vị', 'hay', 'độc đáo', 'bạn nghĩ sao', 'thảo luận'],
      response: 'Câu hỏi thú vị: Tại sao con người cần chính trị? Bởi vì chúng ta sống tập thể, cần quy tắc chung. Không có chính trị, xã hội sẽ hỗn loạn như "trò chơi không luật lệ"!'
    },
    {
      keywords: ['tương lai', 'mai sau', 'phát triển'],
      response: 'Tương lai chính trị: Có thể kết hợp tốt nhất của nhiều lý thuyết. Ví dụ: Dân chủ + công bằng xã hội + quyền con người. Việt Nam đang xây dựng xã hội đó!'
    },
    {
      keywords: ['câu hỏi khó', 'phức tạp', 'sâu sắc'],
      response: 'Câu hỏi sâu sắc: Quyền lực có thể thay đổi con người không? Foucault nói có - quyền lực tạo ra "chủ thể". Ví dụ: Học sinh trở thành sinh viên có trách nhiệm hơn.'
    }
  ],

  // Câu trả lời mặc định
  default: [
    {
      keywords: [],
      response: 'Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Tôi có thể giúp bạn về:\n1. Phân tích học tập (điểm số, điểm danh, phương pháp học)\n2. Lý thuyết chính trị (chủ nghĩa xã hội, tư bản, dân chủ)\n3. Quyền con người và ứng dụng thực tế\nBạn có thể hỏi cụ thể hơn không?'
    }
  ]
};

// Hàm tìm kiếm câu trả lời dựa trên từ khóa - ĐÃ SỬA

// Hàm tìm kiếm câu trả lời dựa trên từ khóa - ĐÃ SỬA
export const findResponse = (userMessage, studentData = null) => {
  const message = userMessage.toLowerCase().trim();
  
  // Tạo context từ studentData nếu có
  let studentContext = '';
  if (studentData) {
    studentContext = ` ${studentData.name} điểm danh ${studentData.attendance} điểm số ${studentData.examMarks.chapter1}/${studentData.examMarks.chapter2}/${studentData.examMarks.chapter3} truy cập ${studentData.accessFrequency}`.toLowerCase();
  }
  
  const fullContext = message + studentContext;

  // Kiểm tra từng category theo thứ tự ưu tiên
  const categoriesPriority = [
    'greetings',
    'detailed_analysis', 
    'study_plan',
    'self_assessment',
    'resources_support',
    'health_wellness',
    'socialism',
    'capitalism',
    'democracy',
    'human_rights',
    'political_theory',
    'practical_applications',
    'exam_questions',
    'student_life',
    'interesting_questions',
    'default'
  ];

  // Debug: In ra tin nhắn và context để kiểm tra
  console.log('=== DEBUG findResponse ===');
  console.log('Tin nhắn:', message);
  console.log('Student context:', studentContext);
  console.log('Full context:', fullContext);

  for (const category of categoriesPriority) {
    const categoryItems = CHATBOT_DATA[category];
    if (!categoryItems) {
      console.log(`Category "${category}" không tồn tại trong CHATBOT_DATA`);
      continue;
    }

    console.log(`\nĐang kiểm tra category: ${category}`);
    
    for (const item of categoryItems) {
      // Kiểm tra nếu bất kỳ từ khóa nào xuất hiện trong tin nhắn hoặc context
      const hasKeyword = item.keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        
        // Kiểm tra trong tin nhắn
        if (message.includes(keywordLower)) {
          console.log(`✓ Tìm thấy từ khóa "${keyword}" trong tin nhắn`);
          return true;
        }
        // Kiểm tra trong full context (bao gồm student data)
        if (fullContext.includes(keywordLower)) {
          console.log(`✓ Tìm thấy từ khóa "${keyword}" trong full context`);
          return true;
        }
        return false;
      });

      if (hasKeyword) {
        console.log(`✓ Trả lời từ category: ${category}`);
        console.log('Số từ khóa:', item.keywords.length);
        console.log('Từ khóa:', item.keywords);
        
        // Personalize response nếu có studentData và không phải category default
        let finalResponse = item.response;
        
        // Thêm thông tin sinh viên nếu có
        if (studentData && category !== 'default') {
          finalResponse = `✅ ` + finalResponse;
        }
        
        return finalResponse; // DÒNG NÀY ĐÃ ĐƯỢC THÊM VÀO
      }
    }
  }

  // Trả về default nếu không tìm thấy
  return CHATBOT_DATA.default[0].response;
};

// Hàm phân tích chi tiết sinh viên (dùng cho phân tích ban đầu)
export const analyzeStudentProgress = (student) => {
  const attendanceRatio = parseInt(student.attendance.split('/')[0]) / parseInt(student.attendance.split('/')[1]);
  const avgExamMark = (student.examMarks.chapter1 + student.examMarks.chapter2 + student.examMarks.chapter3) / 3;
  const accessFreq = parseInt(student.accessFrequency.split(' ')[0]);

  let analysis = `📊 **PHÂN TÍCH CHI TIẾT TIẾN ĐỘ HỌC TẬP CỦA ${student.name.toUpperCase()}**\n\n`;

  // Đánh giá điểm danh
  analysis += `📅 **ĐIỂM DANH:** ${student.attendance} (${(attendanceRatio*100).toFixed(0)}%)\n`;
  if (attendanceRatio >= 0.8) {
    analysis += `✅ **XUẤT SẮC!** Bạn rất chăm chỉ tham gia lớp học. Tiếp tục duy trì để không bỏ lỡ kiến thức quan trọng.\n\n`;
  } else if (attendanceRatio >= 0.6) {
    analysis += `⚠️ **KHÁ TỐT.** Bạn cần cố gắng tham gia đầy đủ hơn. Mỗi buổi học đều có kiến thức trọng tâm.\n\n`;
  } else {
    analysis += `❌ **CẦN CẢI THIỆN.** Tham gia lớp học ảnh hưởng trực tiếp đến kết quả. Hãy đặt mục tiêu tăng tỷ lệ điểm danh.\n\n`;
  }

  // Đánh giá bài kiểm tra chi tiết từng chương
  analysis += `📝 **ĐIỂM KIỂM TRA CHI TIẾT:**\n`;
  analysis += `• Chương 1 - Giá trị thặng dư: ${student.examMarks.chapter1}/10 ${student.examMarks.chapter1 < 6 ? '❌' : student.examMarks.chapter1 < 8 ? '⚠️' : '✅'}\n`;
  analysis += `• Chương 2 - Biện chứng duy vật: ${student.examMarks.chapter2}/10 ${student.examMarks.chapter2 < 6 ? '❌' : student.examMarks.chapter2 < 8 ? '⚠️' : '✅'}\n`;
  analysis += `• Chương 3 - Dân chủ và quyền con người: ${student.examMarks.chapter3}/10 ${student.examMarks.chapter3 < 6 ? '❌' : student.examMarks.chapter3 < 8 ? '⚠️' : '✅'}\n`;
  analysis += `• **ĐIỂM TRUNG BÌNH:** ${avgExamMark.toFixed(1)}/10\n\n`;

  if (avgExamMark >= 8) {
    analysis += `🎉 **KẾT QUẢ XUẤT SẮC!** Bạn đã nắm vững kiến thức cơ bản về lý luận chính trị. Hãy thử thách bản thân với các câu hỏi phân tích sâu hơn.\n\n`;
  } else if (avgExamMark >= 6) {
    analysis += `👍 **KẾT QUẢ KHÁ TỐT.** Bạn đã hiểu cơ bản các khái niệm. Tiếp tục cố gắng để đạt điểm cao hơn!\n\n`;
  } else {
    analysis += `📚 **CẦN ÔN TẬP LẠI.** Các chủ đề cần tập trung:\n`;
    if (student.examMarks.chapter1 < 6) analysis += `• **Chương 1:** Giá trị thặng dư và quy luật giá trị\n`;
    if (student.examMarks.chapter2 < 6) analysis += `• **Chương 2:** Biện chứng duy vật và chủ nghĩa xã hội khoa học\n`;
    if (student.examMarks.chapter3 < 6) analysis += `• **Chương 3:** Dân chủ và quyền con người\n`;
    analysis += `\n`;
  }

  // Đánh giá tần suất truy cập
  analysis += `🌐 **TẦN SUẤT TRUY CẬP TÀI LIỆU:** ${student.accessFrequency}\n`;
  if (accessFreq >= 20) {
    analysis += `🔥 **RẤT TÍCH CỰC!** Bạn có tinh thần tự học và chủ động tìm kiếm kiến thức. Tiếp tục phát huy!\n\n`;
  } else if (accessFreq >= 10) {
    analysis += `👍 **TỐT.** Bạn có thói quen học tập đều đặn. Hãy tăng cường thêm để nắm vững kiến thức hơn.\n\n`;
  } else {
    analysis += `⚠️ **CẦN TĂNG CƯỜNG.** Truy cập tài liệu thường xuyên giúp củng cố kiến thức. Đặt mục tiêu truy cập ít nhất 2-3 lần/tuần.\n\n`;
  }

  // Khuyến nghị tổng thể dựa trên phân tích
  analysis += `💡 **KHUYẾN NGHỊ CÁ NHÂN HÓA:**\n`;
  
  const recommendations = [];
  
  if (attendanceRatio < 0.8) {
    recommendations.push(`• **Tăng cường điểm danh:** Đặt mục tiêu tham gia ít nhất 90% buổi học`);
  }
  
  if (avgExamMark < 8) {
    recommendations.push(`• **Cải thiện điểm số:** Tập trung ôn tập chương điểm thấp, làm thêm bài tập`);
  }
  
  if (accessFreq < 15) {
    recommendations.push(`• **Truy cập tài liệu thường xuyên hơn:** Đặt lịch học cố định mỗi tuần`);
  }
  
  if (student.examMarks.chapter1 < 6) {
    recommendations.push(`• **Ôn tập chương 1:** Học lại khái niệm giá trị thặng dư, xem video bài giảng bổ sung`);
  }
  
  if (student.examMarks.chapter2 < 6) {
    recommendations.push(`• **Ôn tập chương 2:** Làm sơ đồ tư duy về biện chứng duy vật`);
  }
  
  if (student.examMarks.chapter3 < 6) {
    recommendations.push(`• **Ôn tập chương 3:** So sánh các hình thức dân chủ, học thuộc các thế hệ quyền`);
  }
  
  if (recommendations.length > 0) {
    recommendations.forEach(rec => analysis += `${rec}\n`);
  } else {
    analysis += `• Tiếp tục duy trì thói quen học tập tốt hiện tại\n`;
    analysis += `• Thử thách bản thân với các câu hỏi phân tích sâu hơn\n`;
    analysis += `• Chia sẻ kinh nghiệm học tập với bạn bè\n`;
  }
  
  analysis += `\n⏰ **KẾ HOẠCH HÀNH ĐỘNG TRONG 1 THÁNG:**\n`;
  analysis += `1. Tuần 1: Ôn tập chương điểm thấp nhất\n`;
  analysis += `2. Tuần 2: Làm bài tập bổ sung\n`;
  analysis += `3. Tuần 3: Tham gia thảo luận nhóm\n`;
  analysis += `4. Tuần 4: Tổng ôn và tự đánh giá\n`;

  return analysis;
};