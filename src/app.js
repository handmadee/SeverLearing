require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { checkOverloadConnect } = require('./helpers/check.connect');
const router = require('./router');
const app = express();


// init middeleware 
app.use(morgan('dev')); // log request
app.use(helmet()); // bảo mật ứng dụng web
app.use(compression()); // giam dung luong trang web và tăng tốc độ tải trang web

// init db 
require('./dbs/init.mongodb');
checkOverloadConnect();
// handle routes
app.use('', router);



// hanđing errors 

module.exports = app; 