// Pus thông báo 
const express = require('express');
const { asnycHandler } = require('../../helpers/asyncHandler');
const NotificationFireBaseControler = require('../../controllers/firebase/push.notification');
const { upload } = require('../../untils/upload');
const router = express.Router();



router.post('/app/pushNotification',
    upload.single('image')
    , asnycHandler(NotificationFireBaseControler.sendNotification));
router.post('/app/scheduleNotification', upload.single('image'), asnycHandler(NotificationFireBaseControler.scheduleNotification));
router.post('/app/scheduleNotificationMonth', upload.single('image'), asnycHandler(NotificationFireBaseControler.scheduleNotificationMonth));
router.post('/app/scheduleNotificationDaily', upload.single('image'), asnycHandler(NotificationFireBaseControler.scheduleNotificationDaily));
router.delete('/app/cancelNotification/:jobId', asnycHandler(NotificationFireBaseControler.cancelNotification));
// HIỂN THỊ CHIẾN DỊCH 
router.get('/app/getAllJob', asnycHandler(NotificationFireBaseControler.getAllJob));


module.exports = router;