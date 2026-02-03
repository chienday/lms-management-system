# Hướng Dẫn Sử Dụng Chatbot AI Lý Thuyết Chính Trị với OpenAI API

## Tổng quan
Chatbot AI này sử dụng công nghệ RAG (Retrieval-Augmented Generation) với OpenAI API (có free tier) để trả lời các câu hỏi về lý thuyết chính trị. Hệ thống kết hợp:
- **OpenAI GPT-3.5-turbo**: Model AI mạnh mẽ với free credits
- **ChromaDB**: Cơ sở dữ liệu vector cục bộ
- **Sentence Transformers**: Embedding cục bộ cho hiệu suất cao

## Cài đặt và Chạy

### Bước 1: Lấy OpenAI API Key
1. Đăng ký tài khoản tại: https://platform.openai.com
2. Vào phần **API Keys**
3. Tạo **New API Key**
4. **Lưu ý**: OpenAI cung cấp **$5 free credits** cho tài khoản mới

### Bước 2: Chuẩn bị môi trường Python
```bash
# Tạo virtual environment
python -m venv rag_env

# Kích hoạt virtual environment
# Windows:
rag_env\Scripts\activate
# Linux/Mac:
source rag_env/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

### Bước 3: Cấu hình API key
Thêm API key vào file `.env`:
```bash
cp .env.example .env
# Chỉnh sửa file .env:
OPENAI_API_KEY=sk-your-api-key-here
```

### Bước 4: Chạy hệ thống
**Cách 1: Sử dụng script tự động (Windows)**
```bash
run.bat
```

**Cách 2: Chạy thủ công**
```bash
# Kích hoạt virtual environment
rag_env\Scripts\activate

# Ingest tài liệu
python src/ingest_documents.py

# Chạy API server
python src/api.py
```

## Sử dụng Chatbot

### Truy cập
1. Mở ứng dụng LMS
2. Đăng nhập với tài khoản Admin
3. Click vào button **"Chatbot"** trong sidebar

### Các tính năng

#### 💬 Trò chuyện
- Gửi câu hỏi về lý thuyết chính trị
- AI sẽ phân tích và trả lời dựa trên tài liệu có sẵn
- Hỗ trợ cả tiếng Việt và tiếng Anh

#### 📝 Ví dụ câu hỏi
```
"Giải thích khái niệm dân chủ theo Aristotle?"
"Chủ nghĩa xã hội khác gì chủ nghĩa tư bản?"
"Quyền con người gồm những thế hệ nào?"
"Tư tưởng chính trị của Plato?"
```

#### 📚 Lịch sử trò chuyện
- Xem lại các cuộc trò chuyện trước đó
- Lịch sử được lưu trữ theo session
- Click "Lịch sử" để xem chi tiết

#### 🗑️ Xóa chat
- Button "Xóa chat" để xóa toàn bộ lịch sử
- Lưu ý: Hành động này không thể hoàn tác

## Workflow Hoạt Động

### 1. Tạo câu hỏi nghiên cứu
AI phân tích câu hỏi của bạn và tạo ra 3-5 câu hỏi nghiên cứu liên quan.

### 2. Tìm kiếm tài liệu
Hệ thống tìm kiếm trong cơ sở dữ liệu vector để tìm tài liệu liên quan.

### 3. Đánh giá độ liên quan
Mỗi tài liệu được đánh giá độ liên quan (1-10) bởi GPT-3.5-turbo.

### 4. Tổng hợp và trả lời
AI tổng hợp thông tin và tạo ra câu trả lời chi tiết, có cấu trúc.

## Cấu trúc Dự Án

```
RAG/
├── documents/           # Tài liệu chính trị (PDF, TXT, MD)
├── src/
│   ├── agents/         # RAG agent chính
│   ├── models/         # OpenAI model integration
│   ├── utils/          # Vector retriever
│   ├── config.py       # Cấu hình
│   ├── ingest_documents.py  # Script ingest tài liệu
│   └── api.py          # FastAPI server
├── data/               # Vector database (ChromaDB)
├── requirements.txt    # Python dependencies
├── .env.example        # Template cấu hình
├── run.bat            # Script chạy Windows
└── README.md          # Tài liệu này
```

## API Endpoints

### POST /chat
Gửi tin nhắn và nhận phản hồi AI.

**Request:**
```json
{
  "message": "Câu hỏi của bạn",
  "session_id": "default"
}
```

**Response:**
```json
{
  "response": "Câu trả lời của AI",
  "timestamp": "2024-01-01T12:00:00",
  "session_id": "default"
}
```

### GET /history/{session_id}
Lấy lịch sử trò chuyện.

### DELETE /history/{session_id}
Xóa lịch sử trò chuyện của session.

## Xử lý sự cố

### Lỗi API key OpenAI
```
ValueError: OPENAI_API_KEY is required
```
**Giải pháp:**
1. Kiểm tra API key trong `.env`
2. Đăng ký lại tại openai.com nếu cần

### Lỗi kết nối API
```
OpenAI API error: ...
```
**Giải pháp:**
1. Kiểm tra kết nối internet
2. Kiểm tra API key có hợp lệ
3. Kiểm tra quota free credits còn đủ

### Lỗi thiếu dependencies
```
ModuleNotFoundError: No module named 'openai'
```
**Giải pháp:**
```bash
pip install -r requirements.txt
```

## Mở rộng hệ thống

### Thêm tài liệu mới
1. Đặt file tài liệu vào thư mục `documents/`
2. Chạy lại: `python src/ingest_documents.py`

### Thay đổi model
Sửa trong `.env`:
```bash
OPENAI_MODEL=gpt-4  # Hoặc gpt-3.5-turbo
```

### Tùy chỉnh prompt
Sửa trong `src/models/openai_model.py` để thay đổi cách AI trả lời.

## Ưu điểm của OpenAI API

### Free Tier
- **$5 credits** cho tài khoản mới
- Đủ cho hàng nghìn câu hỏi chính trị
- Không cần cài đặt model cục bộ

### Hiệu suất cao
- GPT-3.5-turbo nhanh và chính xác
- Hiểu ngữ cảnh tốt
- Hỗ trợ tiếng Việt

### Dễ mở rộng
- Upgrade lên GPT-4 khi cần
- API ổn định và đáng tin cậy
- Documentation chi tiết

Chatbot này được thiết kế đặc biệt cho việc học tập lý thuyết chính trị và có thể mở rộng để hỗ trợ các môn học khác.