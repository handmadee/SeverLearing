require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const router = require('./router');
const adminRouter = require('./router/layouts/admin');
const configViewEngine = require('./configs/config.viewEngine');
const app = express();
app.set("view engine", "ejs");

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "img-src": ["'self'", "https: data: blob:"],
        },
    })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize database connection
require('./dbs/init.mongodb');
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
app.use((error, res, next) => {
    res.status(error.statusCode || 500);
    res.json({
        error: {
            message: error.message || 'Server error',
            statusCode: error.statusCode || 500
        }
    });
});

module.exports = app;
