// Pus thông báo 
const express = require('express');
const { asnycHandler } = require('../../helpers/asyncHandler');
const { sendNotification } = require('../../controllers/firebase/push.notification');
const upload = require('../../untils/upload');
const router = express.Router();


router.post('/app/pushNotification',
    upload.single('image')
    , asnycHandler(sendNotification));

module.exports = router;