# TSMART SeverLearing

Hệ thống quản lý học tập trực tuyến và điểm danh thông minh TSMART.

## Giới thiệu

TSMART SeverLearing là một nền tảng học tập trực tuyến kết hợp với hệ thống điểm danh thông minh. Hệ thống được phát triển với Node.js, Express và MongoDB, cung cấp API RESTful để hỗ trợ các ứng dụng web và di động.

## Yêu cầu hệ thống

- Node.js (v14 trở lên)
- MongoDB (local hoặc MongoDB Atlas)
- NPM hoặc Yarn

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd SeverLearing
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` dựa trên các biến môi trường trong repository, hoặc sử dụng file `.env` có sẵn. Cần cấu hình các thông số quan trọng:

```
# Môi trường (dev, test, product)
NODE_ENV=dev

# Cài đặt cơ sở dữ liệu
DEV_APP_PORT=3052
DEV_DB_HOST=localhost
DEV_DB_PORT=27017
DEV_DB_NAME=Tsmart

# Cấu hình bảo mật
ACCESS_TOKEN_SECRET=3df701113abe
REFRESH_TOKEN_SECRET=4ef701113abe

# Thông tin MongoDB Atlas (nếu sử dụng)
DEV_URI_CLOUD=mongodb+srv://<username>:<password>@<cluster>/<database>
```

## Chạy ứng dụng

### Môi trường phát triển (Development)

```bash
npm start
```

Ứng dụng sẽ chạy ở địa chỉ: http://localhost:3052

### Môi trường sản xuất (Production)

Cài đặt biến môi trường `NODE_ENV=product` trong file `.env` và chạy:

```bash
node sever.js
```

## Cấu trúc dự án

```
├── src/                     # Thư mục chính chứa mã nguồn
│   ├── app.js               # Cấu hình Express và khởi tạo ứng dụng
│   ├── auth/                # Xác thực và phân quyền
│   ├── configs/             # Cấu hình hệ thống
│   ├── controllers/         # Xử lý logic nghiệp vụ
│   ├── core/                # Các hàm core và utilities
│   ├── dbs/                 # Kết nối cơ sở dữ liệu
│   ├── middleware/          # Middleware
│   ├── models/              # Mô hình dữ liệu MongoDB
│   ├── public/              # Tài nguyên tĩnh
│   ├── router/              # Định tuyến API
│   ├── services/            # Logic nghiệp vụ
│   └── views/               # Giao diện người dùng
├── .env                     # Biến môi trường
└── sever.js                 # Điểm khởi chạy ứng dụng
```

## API Endpoints

BaseURL: `http://localhost:3052/v1/api`

### Xác thực

- `POST /auth/signup` - Đăng ký tài khoản mới
- `POST /auth/login` - Đăng nhập
- `POST /auth/verify-token` - Xác thực token
- `POST /auth/refresh-token` - Làm mới token
- `POST /auth/logout` - Đăng xuất

### Quản lý người dùng

- `GET /user` - Lấy danh sách người dùng
- `POST /user` - Tạo thông tin người dùng
- `GET /auth/user/:id` - Lấy thông tin người dùng theo ID
- `PUT /user/:id` - Cập nhật thông tin người dùng
- `DELETE /user/:id` - Xóa thông tin người dùng

### Quản lý khóa học

- `GET /category` - Lấy danh mục khóa học
- `POST /category` - Tạo danh mục khóa học
- `GET /course` - Lấy danh sách khóa học
- `POST /course` - Tạo khóa học mới
- `GET /course/:id` - Lấy thông tin khóa học theo ID
- `PUT /course/:id` - Cập nhật khóa học
- `DELETE /course/:id` - Xóa khóa học

### Quy trình tạo khóa học

1. Tạo danh mục (Category)

   ```json
   POST /category
   {
     "nameCategory": "Tên danh mục"
   }
   ```

2. Tạo khóa học (Course)

   ```json
   POST /course
   {
     "imageCourse": [file],
     "title": "Tên khóa học",
     "detailCourse": "Mô tả chi tiết",
     "category_id": "ID_danh_mục"
   }
   ```

3. Tạo chương (Chapter)

   ```json
   POST /chapter
   {
     "titleChapter": "Tên chương",
     "courseId": "ID_khóa_học"
   }
   ```

4. Tạo bài học (Lesson)

   ```json
   POST /lesson
   {
     "titleLesson": "Tên bài học",
     "urlVideo": "URL_video",
     "chaptter_id": "ID_chương"
   }
   ```

5. Tạo bài kiểm tra (Exam)

   ```json
   POST /quiz
   {
     "title": "Tên bài kiểm tra",
     "chaptter_id": "ID_chương"
   }
   ```

6. Tạo câu hỏi (Question)

   ```json
   POST /question
   {
     "question": "Nội dung câu hỏi",
     "exam_id": "ID_bài_kiểm_tra"
   }
   ```

7. Tạo câu trả lời (Answer)
   ```json
   POST /answer
   {
     "titleAnswer": "Nội dung câu trả lời",
     "isCorrect": true/false,
     "question_id": "ID_câu_hỏi"
   }
   ```

## Theo dõi và lưu trữ

Để lưu trữ quá trình học của người dùng:

```json
POST /tracking
{
  "idAccount": "ID_tài_khoản",
  "idCourse": "ID_khóa_học"
}
```

Truy vấn tiến độ học tập:

```
GET /trackingUser/:id  # Theo dõi khóa học của người dùng
GET /trackingFull      # Lấy tất cả dữ liệu theo dõi
```

## Triển khai lên Heroku

1. Tạo tài khoản Heroku và cài đặt Heroku CLI
2. Đăng nhập Heroku
   ```bash
   heroku login
   ```
3. Tạo ứng dụng Heroku
   ```bash
   heroku create app-name
   ```
4. Thiết lập các biến môi trường
   ```bash
   heroku config:set NODE_ENV=product
   heroku config:set PROD_DB_HOST=your_mongodb_uri
   # Thiết lập các biến môi trường khác...
   ```
5. Triển khai ứng dụng
   ```bash
   git push heroku main
   ```

## Tác giả

Console - TSMART Team
