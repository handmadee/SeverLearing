const express = require('express');
const { asnycHandler } = require('../../helpers/asyncHandler');
const fcmTokenController = require('../../controllers/firebase/fcmToken.controller');
const router = express.Router();

// router for fcmToken
router.post('/fcmtoken', asnycHandler(fcmTokenController.createFcmToken));
router.get('/fcmtoken', asnycHandler(fcmTokenController.getFcmToken));
router.get('/fcmtoken/search', asnycHandler(fcmTokenController.searchFcmToken));
router.get('/fcmtoken/:id', asnycHandler(fcmTokenController.getFcmTokenById));
router.put('/fcmtoken/:id', asnycHandler(fcmTokenController.updateFcmToken));
router.delete('/fcmtoken/:id', asnycHandler(fcmTokenController.deleteFcmToken));
router.delete('/fcmtoken/account/:accountId', asnycHandler(fcmTokenController.deleteFcmTokenByAccountId));

module.exports = router;
