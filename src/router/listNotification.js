'use state'
'use strict';

const express = require('express');
const upload = require('./../untils/upload');
const NotificationController = require('../controllers/notification.controller');
const { asnycHandler } = require('../helpers/asyncHandler');
const router = express.Router();

// Create User 
router.get('/notificationList', asnycHandler(NotificationController.listNotification));
router.post('/notificationList', upload.single('listNotificaiton'), asnycHandler(NotificationController.createNotification));
router.put('/notificationList/:id', upload.single('listNotificaiton'), asnycHandler(NotificationController.updateNotification));
router.delete('/notificationList/:id', asnycHandler(NotificationController.deleteNotification));

module.exports = router;