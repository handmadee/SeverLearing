require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { checkOverloadConnect } = require('./helpers/check.connect');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const router = require('./router');
const adminRouter = require('./router/layouts/admin');
const configViewEngine = require('./configs/config.viewEngine');
const app = express();
app.set("view engine", "ejs");

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(morgan('dev')); // Log HTTP requests
app.use(helmet()); // Set various HTTP headers for security
app.use(compression()); // Compress response bodies for faster transmission
app.use(express.json()); // Parse incoming request bodies with JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data with querystring library
app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names

// Initialize database connection
require('./dbs/init.mongodb');
checkOverloadConnect();
// Set up static files directory
configViewEngine(app)
// Initialize router
app.use('/', router);
app.use('/', router.get('/v1/api/keep', (req, res) => {
    res.send('Keep alive');
}));
app.use('/admin', adminRouter);

// Handle 404 errors
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// Handle other errors
app.use((error, req, res, next) => {
    res.status(error.statusCode || 500);
    res.json({
        error: {
            message: error.message || 'Server error',
            statusCode: error.statusCode || 500
        }
    });
});

module.exports = app;
