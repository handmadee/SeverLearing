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

// Initialize router
const router = express.Router();

// Use routes
router.use(UPLOADS_PATH, express.static(path.join(__dirname, '../public/uploads')));
router.use(API_V1_PATH, accessRoutes);
router.use(API_V1_PATH, userRoutes);
router.use(API_V1_PATH, courseRoutes);
router.use(API_V1_PATH, notificationRoutes);

module.exports = router;