'use strict';

const express = require('express');
const path = require('path');

// Define API paths
const API_V1_PATH = '/v1/api';
const UPLOADS_PATH = '/uploads';

// Import routes
const accessRoutes = require('./access');
const userRoutes = require('./user/user.router');
const courseRoutes = require('./course/index');
const notificationRoutes = require('./listNotification');
const trakingQuizRouters = require('./trakingQuiz/trakingQuiz.router');
const newsRoutes = require('./news/index');
const popupRouter = require('./popup/popup');
const firebaseRoutes = require('./firebase/notification.firebase');
const fcmRouter = require('./firebase/fcmToken.firebase');
const studentsShecheduleRoutes = require('./shechedule/index');


// Initialize router
const router = express.Router();
// Use routes
router.use(UPLOADS_PATH, express.static(path.join(__dirname, '../public/uploads')));
router.use(API_V1_PATH, accessRoutes);
router.use(API_V1_PATH, userRoutes);
router.use(API_V1_PATH, courseRoutes);
router.use(API_V1_PATH, notificationRoutes);
router.use(API_V1_PATH, trakingQuizRouters);
router.use(API_V1_PATH, newsRoutes);
router.use(API_V1_PATH, popupRouter);
router.use(API_V1_PATH, firebaseRoutes);
router.use(API_V1_PATH, fcmRouter);
router.use(API_V1_PATH, studentsShecheduleRoutes);



module.exports = router;