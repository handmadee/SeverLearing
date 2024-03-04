# ecommereBackEndNodeJS

get node-modunled vào gitignore bằng lệnh echo "node_modules/" >> .gitignore

// cấu hình và nhiệm vụ các forder
cấu hình thư viện

nodemon <Xem status liên tục khi ctr + S>
express <Library của node js >
thường là 1 khung ứng dụng web cho Node.js
nó được thiết kế và xây dựng ứng dụng web và api
nó là 1 phần công cự phát triển fullstack Javascripts
MEAN stack bao gồm : Mongodbm Express Angularjs Node js

// morgan là thư viện để mà in ra các log khi mà 1 người dùng chạy
"Morgan" là một middleware logger request dành cho Node.js. Nó được sử dụng để ghi lại thông tin chi tiết về các yêu cầu HTTP đến máy chủ. Thông tin này có thể bao gồm thời gian yêu cầu, phương thức HTTP, URL, trạng thái, kích thước nội dung và thời gian phản hồi.

"Helmet" là một package trong Node.js giúp tăng cường bảo mật cho các ứng dụng Express. Nó đặt một số tiêu đề HTTP, mà nhiều trong số đó liên quan đến bảo mật, để giúp bảo vệ ứng dụng của bạn khỏi một số lỗ hổng bảo mật phổ biến.

Ví dụ, Helmet có thể:
Ngăn chặn clickjacking bằng cách đặt tiêu đề X-Frame-Options.
Ẩn X-Powered-By để không để lộ công nghệ đang chạy trên máy chủ.
Đặt tiêu đề Content Security Policy để giúp ngăn chặn các cuộc tấn công cross-site scripting và các loại tấn công khác.
Và nhiều hơn nữa.
Vì vậy, Helmet giúp làm cho ứng dụng Express của bạn an toàn hơn.

// Connect theo cách mới
// Kiểm tra hệ thống có bao nhiêu connect
// Thông báo khi sever quá tải connect  
// Có nên dùng disconect liên tục hay không
// Poolsize là gì
.. xác định số lượng kết nối cơ sở dữ liệu được giữ sẵn trong 1 bể kết nối
//. Bể kết nối giữ các kết nối sẵn sàng để sử dụng, giúp giảm thời gian tạo và đóng kết nối, cũng như tối ưu hiệu suất của ứng dụng.
// Nếu vượt quá kết nối PoolSize

// until là viết về Func
// helper 1 file uỷ quyền, khi nào cần tới mới gọi

// Desgin parten
// Nguyên tắc trách nhiệm duy nhất
// Nguyên tắc mở rộng

// Anti-parteern
// Clean code
// SOLID Principle
// Refactoring

// Sử dụng mô hình MVC

// => Conttroller
Controllers là thành phần trung gian giữa models và views. Chúng xử lý yêu cầu đầu vào từ người dùng (thông qua views), tương tác với models để lấy dữ liệu, và sau đó trả về dữ liệu phù hợp đến views để hiển thị. Trong một ứng dụng web, một controller có thể xử lý các yêu cầu HTTP, như GET, POST, PUT, DELETE, etc.

// => Service
Services là thành phần chứa logic kinh doanh cốt lõi của ứng dụng. Chúng thực hiện các tác vụ cụ thể và có thể được gọi bởi controllers. Services thường không tương tác trực tiếp với người dùng, nhưng thay vào đó, chúng xử lý dữ liệu từ controllers, thực hiện các tác vụ cần thiết, và sau đó trả về kết quả đến controllers. Services giúp giữ cho controllers gọn gàng và dễ đọc hơn bằng cách tách biệt logic kinh doanh ra khỏi controllers.

// lean() => giảm tải các size của 1 obj

// return 1 obj của mongo C =>
// trả về 1 obj thuần tuý

// create account => {
... return Login
}

// create account => {
.. => home
}

// create token public key <Bất đối xứng >
// byte password (bcrypt)
// crypto
