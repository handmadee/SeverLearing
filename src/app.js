require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { checkOverloadConnect } = require('./helpers/check.connect');
const cors = require('cors');
const router = require('./router');
const app = express();
app.use(cors());
// init middeleware 
app.use(morgan('dev')); // log request
app.use(helmet()); // bảo mật ứng dụng web
app.use(compression()); // giam dung luong trang web và tăng tốc độ tải trang web
app.use(express.json()); // vì dữ liệu thường được post lên  dưới dạng json
app.use(express.urlencoded({ extended: true })); // là phương thức sử dụng để mã hoá dữ liệu được gửi trên url nó chuyển đổi các kú tự không an toàn thành 1 định dạng có thể truyền qua url 


// init db 
require('./dbs/init.mongodb');
checkOverloadConnect();
///
app.use('/', router);
// handler errors
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})
app.use((error, req, res, next) => {
    res.status(error.statusCode || 500);
    res.json({
        error: {
            message: error.message || 'Sever error',
            statusCode: error.statusCode || 500
        }
    })
})

module.exports = app; 