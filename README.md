# LMS – Hệ thống Quản lý Trường học (School Management System)

## Tổng quan

**LMS – Hệ thống Quản lý Trường học** là một ứng dụng web hiện đại được xây dựng trên nền tảng **MERN (MongoDB, Express.js, React.js, Node.js)**. Hệ thống được thiết kế nhằm số hóa và tự động hóa các nghiệp vụ quản lý giáo dục, đồng thời hỗ trợ hiệu quả cho hoạt động giảng dạy, học tập và theo dõi kết quả học tập trong nhà trường.

Dự án hướng tới việc xây dựng một **nền tảng LMS tập trung**, có khả năng mở rộng cao, giao diện thân thiện và đảm bảo an toàn dữ liệu cho các đối tượng sử dụng gồm: Quản trị viên, Giảng viên, Sinh viên và Phụ huynh.

---

## Mục tiêu dự án

* Tập trung hóa và tự động hóa các công việc quản lý trường học
* Hỗ trợ quản lý lớp học, môn học và người dùng một cách hiệu quả
* Tăng cường giao tiếp và tương tác giữa các bên liên quan
* Cung cấp công cụ thống kê, phân tích dữ liệu phục vụ ra quyết định
* Đảm bảo tính bảo mật, ổn định và khả năng mở rộng của hệ thống

---

## Chức năng chính

### 1. Phân quyền người dùng

Hệ thống LMS hỗ trợ ba vai trò chính:

* **Admin (Quản trị viên):** Quản lý toàn bộ hệ thống
* **Teacher (Giảng viên):** Quản lý giảng dạy, điểm danh và đánh giá
* **Student (Sinh viên/Phụ huynh):** Theo dõi kết quả học tập và trao đổi thông tin

Mỗi vai trò được phân quyền truy cập rõ ràng, đảm bảo an toàn dữ liệu.

---

### 2. Dashboard quản trị

* Thêm và quản lý thông tin sinh viên, giảng viên
* Tạo và quản lý lớp học, môn học
* Quản lý tài khoản người dùng và cấu hình hệ thống
* Theo dõi tổng quan hoạt động của LMS

---

### 3. Điểm danh

* Giảng viên thực hiện điểm danh theo thời gian thực
* Tự động lưu trữ và tổng hợp dữ liệu điểm danh
* Xuất báo cáo và theo dõi xu hướng chuyên cần của sinh viên

---

### 4. Đánh giá kết quả học tập

* Nhập điểm và nhận xét chi tiết cho sinh viên
* Sinh viên theo dõi điểm số và tiến độ học tập theo thời gian
* Trực quan hóa dữ liệu bằng biểu đồ và bảng thống kê

---

### 5. Giao tiếp nội bộ

* Hệ thống nhắn tin và thông báo giữa Admin, Giảng viên và Sinh viên
* Hỗ trợ trao đổi thông tin nhanh chóng, tăng tính tương tác

---

### 6. Thống kê & Phân tích dữ liệu

* Công cụ báo cáo tích hợp cho giảng viên và quản trị viên
* Biểu đồ, bảng dữ liệu trực quan về học tập và điểm danh
* Hỗ trợ ra quyết định dựa trên dữ liệu thực tế

---

### 7. Bảo mật hệ thống

* Kiểm soát truy cập dựa trên vai trò (RBAC)
* Mã hóa dữ liệu trong quá trình truyền và lưu trữ
* Cập nhật bảo mật định kỳ nhằm hạn chế rủi ro

---

### 8. Khả năng mở rộng & hiệu năng

* Truy xuất dữ liệu nhanh với MongoDB
* Backend linh hoạt, dễ mở rộng với Node.js và Express.js
* Đáp ứng tốt khi có số lượng lớn người dùng truy cập đồng thời

---

## Công nghệ sử dụng

### Frontend

* React.js
* Material UI
* Redux

### Backend

* Node.js
* Express.js

### Cơ sở dữ liệu

* MongoDB

---

## Triển khai hệ thống

* **Frontend:** Triển khai trên Netlify
* **Backend:** Triển khai trên Render

Hệ thống hỗ trợ cài đặt và chạy ở môi trường local cũng như triển khai trên môi trường production.

---

## Giá trị mang lại

LMS – Hệ thống Quản lý Trường học giúp:

* Giảm tải công việc hành chính
* Nâng cao hiệu quả quản lý và giảng dạy
* Tăng tính minh bạch và kết nối giữa nhà trường – giảng viên – sinh viên
* Tạo nền tảng cho các ứng dụng phân tích và trí tuệ nhân tạo trong giáo dục

---

## Hướng phát triển trong tương lai

* Tích hợp **Chatbot AI dựa trên mô hình Retrieval-Augmented Generation (RAG)**
* Xây dựng mô-đun **Learning Analytics** phân tích hành vi học tập
* Cá nhân hóa trải nghiệm học tập cho sinh viên

---

## Giấy phép

Dự án được phát triển phục vụ mục đích học tập và nghiên cứu.

---

## Nhóm phát triển

Dự án được thực hiện bởi nhóm sinh viên trong khuôn khổ học phần / thực tập chuyên ngành.
