const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const fcmTokenController = require('../../controllers/firebase/fcmToken.controller');
const router = express.Router();

// router for fcmToken
router.post('/fcmtoken', asyncHandler(fcmTokenController.createFcmToken));
router.get('/fcmtoken', asyncHandler(fcmTokenController.getFcmToken));
router.get('/fcmtoken/search', asyncHandler(fcmTokenController.searchFcmToken));
router.get('/fcmtoken/:id', asyncHandler(fcmTokenController.getFcmTokenById));
router.put('/fcmtoken/:id', asyncHandler(fcmTokenController.updateFcmToken));
router.delete('/fcmtoken/:id', asyncHandler(fcmTokenController.deleteFcmToken));
router.delete('/fcmtoken/account/:accountId', asyncHandler(fcmTokenController.deleteFcmTokenByAccountId));

module.exports = router;
