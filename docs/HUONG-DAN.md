# HƯỚNG DẪN SỬ DỤNG DỰ ÁN SEVERLEARING

## Giới thiệu

Đây là tài liệu hướng dẫn chi tiết cách cài đặt và chạy dự án SeverLearing. Dự án này có các nhánh:

- **main**: Nhánh chính, được cập nhật lên Heroku
- **develop**: Nhánh để phát triển tính năng mới hoặc sửa lỗi trong mã nguồn

## Yêu cầu hệ thống

- Node.js (phiên bản khuyến nghị: >= 14.x)
- MongoDB (phiên bản khuyến nghị: >= 4.4)
- NPM hoặc Yarn

## Cài đặt và Chạy dự án

### Bước 1: Clone dự án từ GitHub

```bash
git clone https://github.com/handmadee/SeverLearing.git
cd SeverLearing
```

### Bước 2: Cài đặt các dependency

```bash
npm install
```

### Bước 3: Cấu hình môi trường

Dự án sử dụng file `.env` để cấu hình các biến môi trường. Hãy sao chép file `.env.example` thành `.env` và cấu hình các thông số cần thiết:

```bash
cp .env.example .env
```

Sau đó chỉnh sửa file `.env` với thông tin cấu hình phù hợp (khóa API, thông tin kết nối DB, v.v.).

### Bước 4: Chạy dự án

#### Chế độ phát triển (sử dụng cơ sở dữ liệu địa phương)

```bash
npm run dev
```

#### Chế độ test (sử dụng cơ sở dữ liệu thực tế của trung tâm)

```bash
NODE_ENV=test npm run dev
```

## Cấu trúc dự án

### Cấu trúc thư mục

```
SeverLearing/
├── .env                  # File cấu hình biến môi trường
├── .env.example          # File mẫu cho biến môi trường
├── .git/                 # Thư mục Git
├── .gitignore            # Danh sách file/thư mục bị loại trừ khỏi Git
├── node_modules/         # Thư mục chứa các package phụ thuộc
├── package.json          # Cấu hình dự án và dependencies
├── package-lock.json     # Khóa phiên bản chính xác của dependencies
├── Procfile              # Cấu hình triển khai Heroku
├── README.md             # Thông tin tổng quan về dự án
├── sever.js              # File khởi động server
└── src/                  # Mã nguồn chính của ứng dụng
    ├── app.js            # Cấu hình ứng dụng Express
    ├── configs/          # Cấu hình hệ thống
    ├── controllers/      # Xử lý logic từ routes
    ├── core/             # Core modules của hệ thống
    ├── dbs/              # Kết nối cơ sở dữ liệu
    ├── enums/            # Enumerations và constants
    ├── exportExcel/      # Xử lý xuất dữ liệu sang Excel
    ├── examQuestion/     # Xử lý câu hỏi thi
    ├── feeback/          # Xử lý phản hồi
    ├── helpers/          # Các hàm trợ giúp
    ├── loggers/          # Cấu hình và xử lý logs
    ├── middleware/       # Middleware xử lý requests
    ├── models/           # Mô hình dữ liệu Mongoose
    ├── public/           # Tài nguyên tĩnh (CSS, JS, images)
    ├── router/           # Định nghĩa routes
    ├── services/         # Xử lý logic nghiệp vụ
    ├── tests/            # Unit tests và integration tests
    ├── untils/           # Các tiện ích
    └── views/            # Templates EJS
```

### Các file cấu hình quan trọng

#### 1. config.mongodb.js

- **Đường dẫn**: `src/configs/config.mongodb.js`
- **Mục đích**: Cấu hình kết nối đến MongoDB dựa trên môi trường (dev, test, product)
- **Chi tiết**:
  - `dev`: Cấu hình cho môi trường phát triển (localhost)
  - `test`: Cấu hình cho môi trường test (sử dụng DB của trung tâm)
  - `product`: Cấu hình cho môi trường sản phẩm

#### 2. Các file cấu hình khác trong thư mục configs

- **config.cloudinary.js**: Cấu hình kết nối đến Cloudinary cho lưu trữ hình ảnh
- **config.firebase.js**: Cấu hình kết nối Firebase để gửi thông báo
- **config.viewEngine.js**: Cấu hình view engine (EJS)

#### 3. init.mongodb.js

- **Đường dẫn**: `src/dbs/init.mongodb.js`
- **Mục đích**: Khởi tạo kết nối với MongoDB và xử lý các sự kiện kết nối

### Luồng hoạt động của ứng dụng

1. **sever.js**: Khởi động server và lắng nghe port được cấu hình
2. **app.js**:
   - Cấu hình middleware (cors, morgan, helmet, compression)
   - Khởi tạo kết nối DB qua `init.mongodb.js`
   - Cấu hình các routes và error handling
3. **router/**: Định nghĩa tất cả endpoints API và phân chia theo modules
4. **controllers/**: Xử lý logic của từng request từ routes
5. **services/**: Chứa logic nghiệp vụ, tương tác với models
6. **models/**: Định nghĩa cấu trúc dữ liệu và tương tác với MongoDB

## Quy trình phát triển

1. **Phát triển tính năng mới**:

   ```bash
   # Checkout nhánh develop
   git checkout develop

   # Tạo nhánh feature mới
   git checkout -b feature/ten-tinh-nang

   # Sau khi hoàn thành, merge vào develop
   git checkout develop
   git merge feature/ten-tinh-nang
   ```

2. **Triển khai lên môi trường production**:

   ```bash
   # Merge develop vào main
   git checkout main
   git merge develop

   # Push để triển khai lên Heroku
   git push origin main
   ```

## Cấu hình Môi trường

Dự án sử dụng các biến môi trường để cấu hình các thông số khác nhau. Dưới đây là các biến môi trường quan trọng:

### Cấu hình Database

- `TEST_DB_HOST`: URL kết nối MongoDB cho môi trường test
- `DEV_DB_HOST`: Host MongoDB cho môi trường phát triển (thường là localhost)
- `DEV_DB_PORT`: Port MongoDB cho môi trường phát triển (mặc định 27017)
- `DEV_DB_NAME`: Tên database cho môi trường phát triển
- `PROD_DB_HOST`, `PROD_DB_PORT`, `PROD_DB_NAME`: Cấu hình tương tự cho môi trường production

### Cấu hình Authentication

- `ACCESS_TOKEN_SECRET`: Khóa bí mật cho JWT access token
- `REFRESH_TOKEN_SECRET`: Khóa bí mật cho JWT refresh token

### Cấu hình Cloud Storage (Cloudinary)

- `CLOUD_NAME`: Tên Cloudinary Cloud
- `API_KEY_CLOUD`: API Key Cloudinary
- `API_SECRET_CLOUD`: API Secret Cloudinary

### Cấu hình Firebase

- `GOOGLE_PRIVATE_KEY`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PROJECT_ID`: Thông tin kết nối Firebase

## Chú ý

- Khi chạy dự án với `NODE_ENV=test`, hệ thống sẽ sử dụng cơ sở dữ liệu thực tế của trung tâm
- Đảm bảo cấu hình đúng thông tin kết nối trong file `config.mongodb.js`
- Nếu có thay đổi cấu trúc database, cần đảm bảo cập nhật các model tương ứng
- Các API endpoints chính có thể được tìm thấy trong thư mục `src/router`

## Xử lý lỗi thường gặp

1. **Lỗi kết nối database**:

   - Kiểm tra cấu hình trong file `config.mongodb.js`
   - Đảm bảo MongoDB đã được khởi động
   - Kiểm tra URL kết nối trong biến môi trường

2. **Lỗi khi cài đặt dependency**:

   - Thử xóa thư mục `node_modules` và file `package-lock.json`, sau đó chạy lại `npm install`
   - Kiểm tra phiên bản Node.js (có thể dùng nvm để quản lý)

3. **Lỗi chạy server**:

   - Kiểm tra port đã được sử dụng chưa (mặc định là 3052)
   - Kiểm tra log lỗi và sửa các vấn đề tương ứng
   - Đảm bảo tất cả biến môi trường cần thiết đã được cài đặt

4. **Lỗi khi triển khai lên Heroku**:
   - Kiểm tra Procfile
   - Xem logs Heroku: `heroku logs --tail`
