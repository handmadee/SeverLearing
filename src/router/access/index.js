

const express = require('express');
const userController = require('./../../controllers/access.controller');
const authorization = require('./../../auth/permission');
const { asnycHandler } = require('../../helpers/asyncHandler');
const router = express.Router();


router.post('/auth/signup', asnycHandler(userController.register));
router.post('/auth/login', asnycHandler(userController.login));
router.post('/auth/verify-token', asnycHandler(userController.verifyToken));
router.post('/auth/refresh-token', asnycHandler(userController.refreshToken));
router.post('/auth/logout', asnycHandler(userController.logout));
router.get('/auth/user/:id', asnycHandler(userController.getUser));
// router.get('/admin', authorization(['admin']), asnycHandler(userController.admin));

module.exports = router;