'use state'
'use strict';

const express = require('express');
const { upload } = require('./../untils/upload');
const NotificationController = require('../controllers/notification.controller');
const { asyncHandler } = require('../helpers/asyncHandler');
const router = express.Router();

// Create User 
router.get('/notificationList', asyncHandler(NotificationController.listNotification));
router.post('/notificationList', upload.single('listNotificaiton'), asyncHandler(NotificationController.createNotification));
router.put('/notificationList/:id', upload.single('listNotificaiton'), asyncHandler(NotificationController.updateNotification));
router.delete('/notificationList/:id', asyncHandler(NotificationController.deleteNotification));

module.exports = router;