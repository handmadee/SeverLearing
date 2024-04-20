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

# các stastus http

200 ok : y/c thành công
201 created: y/c tạo thành cônmg
204 no content: y/c thành công nhưng ko có tt
400 bad request: máy chủ o hiểu y/c
401: Unauthrized L y/c bắt xác thực
403 forbidden: hiểu y/c nhưng từ chối thực hiện
404 not found: máy chủ o thể tìm thấy tài nguyên
409 config: được sử dụng khi một yêu cầu không thể được hoàn thành do xung đột với trạng thái hiện tại của tài nguyên mà yêu cầu đó đang cố gắng thay đổi. ("Đã tồn tại")

500 internal sever error: lỗi ko xác định

# 1xx thông tin

# 2xx thànnh công

# 3xx điều hướng lại

# 4xx lỗi ở phía client

# 5xx lỗi ở phía sever

# token là 1 chuỗi kí tự được tạo ra và đại diện cho quyền truy cập của 1 ứng dụng trong quá trình xác thực và uỷ quyền người dùng 241

<!--
Ưu điểm và Nhược điểm cảu JWWT

Đơn giản và dễ sử dụng
Độ tin cận cao
Dữ liệu được lưu trũ trong token để giảm thiểu số lần truy vấn dữ liệu

nhược điểm : Không thể huỷ bỏ token
1 khi token được tạo ra và gửi tới máy khách không thể huỷ bỏ nó trước khi hết thời gian sống hoặc thay đổi

không thể chủ động force logout nhưng sử sụng mã hoá bất đối xứng có thể khắc phục điều dó


 force logout là quá trình mà hệ thống tự dộng đăng xuất người dùng khỏi phiên làm việc hiện tại

 rủi to về bảo mật khi JWT bị lộ
 không hỗ trợ quản lý phiên "Quản lý phiên trong JWT (JSON Web Tokens) liên quan đến việc sử dụng JWT để theo dõi trạng thái phiên làm việc của người dùng. Trong một ứng dụng web hoặc di động, mỗi "phiên" thường bắt đầu khi người dùng đăng nhập và kết thúc khi người dùng đăng xuất."


 -->

# Cơ chế hoạt động của jwt là gì

<!--
Client gửi username và password tới sever để vẻify
login success thì sever sẽ genarate ra (jwt) và gửi về client
Client nhận token đó, rồi lưu trữ trên tình duyệt cookie , localStorage
Khi client gửi 1 resquest tiếp theo tới sever và resquest đó sẽ được đính kèm token nhằm mục đích xác thực
Sever nhận được request và tiến hành xác minh => hợp lệ thì res về cho client != (403) forbiden
 -->

# Xác thực JWT cùng Mã hoá đối xứng

<!--
việc sử dụng mã hoá bất đối xứng để bảo mặt hơn thay vì sử dụng chỉ 1 key duy nhất để vừa giải mã vừa mã hoá


Mã hoá bất đối cứng sử dụng 2 key khác nhau (public key và private key)
public key được chia sẽ với mọi người , vànó được sử dụng đẻ verify không có chiều ngược lại

private key sẽ được giữ bí mật và được sử dụng để mã hoá thông tin tạo ra JWWT (sau khi tạo xong nó sẽ biến mất khỏi hệ thống )

"Nhược điểm phải lưu thêm public key vào DB và truy xuất DB khi cần xác thực " dẫn tới hiệu năng có thể bị ảnh hương : notes => có thể cải thiệt hiệu năng bằng Caches như MemorryCaches hoặc RedisCache

 -->

# resfesh token được sinh ra

<!--
rút ngắn thời gian tồn tại của AT
và khi AT token hết hạn thì thay bằng AT mới

Vô hiệu hoá 1 token ở 1 User nào đó ở ngay phía máy chủ
Cụ thể là khi userLogout hoặc tồi hơn nữa là token bị đánh cắp
 -->

# tại sao timeline của access token lại có thời gian ngắn hơn refesh token

<!--
  Bảo mật : access token khi bị đánh cắp thì giảm thời gian truy cập ứng dụng hơn
  Giảm thiểu rủi ro : refesh token thường được sử dụng để đổi lấy access token mới mà không cần phải đăng nhập lại, giảim thiểu truyền tải khi đăng nhập quá nhiều lần

  -->

# api keys sinh ra để là 1 dạng mã xác thực được sử dụng trong giao tiếp giữa các ứng dụng thông qua API Nó thường dùng để Xác Thực,Quản lý quyền truy cập,Theo dõi và giới hạn sử dụng

# xác thực API - Header API

// lưu trữ token => quản lý về ngày tháng
// permissions
//

# close sure(Trình bao đóng của javascripts) trả về 1 hảm mà hàm đó có thể sử dụng biến của thằng cha

# dinied từ chối =>

# Khi get

# History Courser

<!--
Course :
User :
 -->

 <!-- Tracking User and Course   -->
# SeverLearing
