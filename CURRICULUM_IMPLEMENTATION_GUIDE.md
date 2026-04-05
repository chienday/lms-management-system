# 📖 CURRICULUM MODULE - Implementation Guide

## Giới thiệu
Module Giáo trình (Curriculum) là tính năng hiện đại cho phép giảng viên tạo lập, tổ chức và khai thác giáo trình phục vụ hoạt động giảng dạy.

## Tính Năng Chính

### 1. ✅ Quản Lý Giáo Trình
- Tạo giáo trình mới
- Chỉnh sửa thông tin giáo trình
- Xóa giáo trình
- Xem danh sách giáo trình và tiến độ

### 2. 📚 Quản Lý Chương & Bài Học
- **Cấu trúc phân cấp:**
  - Giáo trình → Chương → Bài học
- **Tính năng:**
  - Thêm/sửa/xóa chương
  - Thêm/sửa/xóa bài học
  - Hiển thị trạng thái (Draft/Published)
  - Sắp xếp thứ tự

### 3. 📤 Quản Lý Tài Liệu
- Tải lên tài liệu (PDF, Word, Excel, PowerPoint)
- Drag & Drop interface
- Xem danh sách tài liệu
- Tải xuống/Xóa tài liệu
- Hiển thị kích thước file

### 4. 🤖 Hỗ Trợ AI
Hệ thống tích hợp AI để xử lý giáo trình:

#### a) Tóm Tắt Nội Dung (Summarize)
- Phân tích tự động nội dung chương
- Rút gọn thành các điểm chính
- Tạo bài tóm tắt dễ hiểu

#### b) Sinh Câu Hỏi (Generate Questions)
- Tạo câu hỏi trắc nghiệm từ nội dung
- Tạo câu hỏi tự luận
- Tuỳ chỉnh độ khó
- Tạo đáp án gợi ý

#### c) Tạo Bài Kiểm Tra (Create Quiz)
- Tạo quiz tự động từ câu hỏi
- Liên kết với câu hỏi được sinh ra
- Thiết lập thời gian làm bài
- Cấu hình đáp án tự động

### 5. 👁 Kiểm Soát Hiển Thị Nội Dung
**Cấu hình chung:**
- Xuất bản/Ẩn giáo trình
- Giới hạn thời gian truy cập
- Giới hạn theo lớp học
- Yêu cầu học sinh hoàn thành
- Cho phép bình luận
- Hiển thị tiến độ

**Kiểm soát từng chương:**
- Hiển thị/Ẩn chương
- Yêu cầu hoàn thành chương
- Sắp xếp thứ tự chương

## Cấu Trúc Thành Phần

```
CurriculumList.js
├─ Danh sách giáo trình
├─ Tạo/Sửa/Xóa giáo trình
└─ Dialog quản lý

CurriculumDetail.js (Tab Interface)
├─ Tab 1: Chương & Bài học
│  └─ ChapterAccordion.js
│     ├─ Accordion danh sách chương
│     └─ Dialog thêm/sửa bài học
├─ Tab 2: Tài liệu
│  └─ DocumentUpload.js
│     ├─ Drag & Drop upload
│     └─ Danh sách tài liệu
├─ Tab 3: AI Processing
│  └─ AIProcessing.js
│     ├─ Lựa chọn chương
│     ├─ Tác vụ AI
│     └─ Lịch sử xử lý
└─ Tab 4: Kiểm Soát Hiển Thị
   └─ ContentControl.js
      ├─ Cấu hình chung
      └─ Kiểm soát từng chương
```

## Routes
- **`/teacher/curriculum`** - Danh sách giáo trình
- **`/teacher/curriculum/:id`** - Chi tiết giáo trình

## Sử Dụng

### Import
```javascript
import CurriculumList from './pages/teacher/curriculum/CurriculumList';
import CurriculumDetail from './pages/teacher/curriculum/CurriculumDetail';
```

### Route Setup
```javascript
<Route path="curriculum" element={<CurriculumList />} />
<Route path="curriculum/:id" element={<CurriculumDetail />} />
```

## API Endpoints Cần Xây Dựng

### Curriculum Management
```
GET    /api/teacher/curriculum           (Lấy danh sách)
POST   /api/teacher/curriculum           (Tạo mới)
PUT    /api/teacher/curriculum/:id       (Cập nhật)
DELETE /api/teacher/curriculum/:id       (Xóa)
GET    /api/teacher/curriculum/:id       (Chi tiết)
```

### Chapter Management
```
POST   /api/teacher/curriculum/:id/chapters           (Thêm chương)
PUT    /api/teacher/curriculum/:id/chapters/:chapterId (Cập nhật)
DELETE /api/teacher/curriculum/:id/chapters/:chapterId (Xóa)
```

### Lesson Management
```
POST   /api/teacher/curriculum/:id/chapters/:chapterId/lessons         (Thêm bài)
PUT    /api/teacher/curriculum/:id/chapters/:chapterId/lessons/:lessonId (Cập nhật)
DELETE /api/teacher/curriculum/:id/chapters/:chapterId/lessons/:lessonId (Xóa)
```

### Document Management
```
POST   /api/teacher/curriculum/:id/documents    (Upload)
DELETE /api/teacher/curriculum/:id/documents/:docId (Xóa)
GET    /api/teacher/curriculum/:id/documents/:docId/download (Tải xuống)
```

### AI Processing
```
POST   /api/teacher/curriculum/:id/ai/summarize        (Tóm tắt)
POST   /api/teacher/curriculum/:id/ai/generate-questions (Sinh câu hỏi)
POST   /api/teacher/curriculum/:id/ai/create-quiz      (Tạo quiz)
GET    /api/teacher/curriculum/:id/ai/history         (Lịch sử)
```

### Content Control
```
PUT    /api/teacher/curriculum/:id/content-control     (Cập nhật)
GET    /api/teacher/curriculum/:id/content-control     (Lấy cấu hình)
```

## Database Schema (Recommended)

### Curriculums
```sql
CREATE TABLE curriculums (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  progress INT DEFAULT 0,
  status ENUM('draft', 'active', 'archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
```

### Chapters
```sql
CREATE TABLE chapters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  curriculum_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  chapter_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curriculum_id) REFERENCES curriculums(id) ON DELETE CASCADE
);
```

### Lessons
```sql
CREATE TABLE lessons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  chapter_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  content LONGTEXT,
  lesson_order INT,
  status ENUM('draft', 'published') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);
```

### Documents
```sql
CREATE TABLE curriculum_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  curriculum_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255),
  file_size VARCHAR(50),
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curriculum_id) REFERENCES curriculums(id) ON DELETE CASCADE
);
```

### Content Controls
```sql
CREATE TABLE content_controls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  curriculum_id INT NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  restrict_by_date BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  restrict_by_class BOOLEAN DEFAULT FALSE,
  require_completion BOOLEAN DEFAULT FALSE,
  allow_comments BOOLEAN DEFAULT TRUE,
  show_progress BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP,
  FOREIGN KEY (curriculum_id) REFERENCES curriculums(id) ON DELETE CASCADE
);
```

## State Management (Optional Redux Integration)

```javascript
// redux/curriculumRelated/curriculumSlice.js
const initialState = {
  curriculumList: [],
  selectedCurriculum: null,
  loading: false,
  error: null,
};
```

## Styling Guidelines
- **Primary Color:** #2563eb (Blue)
- **Secondary Colors:** 
  - Success: #10b981
  - Warning: #f59e0b
  - Error: #ef4444
- **UI Library:** Material-UI + Styled Components
- **Icons:** @mui/icons-material

## Testing Checklist
- [ ] CRUD operations cho Curriculum
- [ ] CRUD operations cho Chapter
- [ ] CRUD operations cho Lesson
- [ ] Document upload (File type validation)
- [ ] AI Processing (Integration test)
- [ ] Content Control (Permission test)
- [ ] Responsive design (Mobile/Tablet/Desktop)
- [ ] Error handling
- [ ] Loading states

## Notes for Backend Developers
1. Implement AI integration cho 3 tác vụ (Summarize, Generate Questions, Create Quiz)
2. File upload handler - validate file types, size limits
3. Authorization - chỉ giảng viên sở hữu mới được sửa/xóa
4. Add pagination cho danh sách giáo trình
5. Implement search functionality
6. Add logging cho AI processing
7. Consider using async jobs cho AI processing dài

## Performance Considerations
- Add pagination cho danh sách tài liệu
- Lazy load chapters/lessons
- Cache AI processing results
- Optimize file upload (chunked upload)
- Database indexing trên `teacher_id`, `curriculum_id`
