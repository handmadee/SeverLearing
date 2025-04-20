// Pus thông báo 
const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const NotificationFireBaseControler = require('../../controllers/firebase/push.notification');
const { upload } = require('../../untils/upload');
const router = express.Router();



router.post('/app/pushNotification',
    upload.single('image')
    , asyncHandler(NotificationFireBaseControler.sendNotification));
router.post('/app/scheduleNotification', upload.single('image'), asyncHandler(NotificationFireBaseControler.scheduleNotification));
router.post('/app/scheduleNotificationMonth', upload.single('image'), asyncHandler(NotificationFireBaseControler.scheduleNotificationMonth));
router.post('/app/scheduleNotificationDaily', upload.single('image'), asyncHandler(NotificationFireBaseControler.scheduleNotificationDaily));
router.delete('/app/cancelNotification/:jobId', asyncHandler(NotificationFireBaseControler.cancelNotification));
// HIỂN THỊ CHIẾN DỊCH 
router.get('/app/getAllJob', asyncHandler(NotificationFireBaseControler.getAllJob));


module.exports = router;