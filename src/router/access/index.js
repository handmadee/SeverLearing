

const express = require('express');
const userController = require('./../../controllers/access.controller');
const { asnycHandler } = require('../../helpers/asyncHandler');
const router = express.Router();


router.post('/auth/signup', asnycHandler(userController.register));
router.post('/auth/login', asnycHandler(userController.login));
router.post('/auth/verify-token', asnycHandler(userController.verifyToken));
router.post('/auth/refresh-token', asnycHandler(userController.refreshToken));
router.post('/auth/logout', asnycHandler(userController.logout));
router.get('/auth/user/:id', asnycHandler(userController.getUser));
router.put('/auth/changePassword', asnycHandler(userController.changePassword));
router.get('/findUserName/:username', asnycHandler(userController.findUserByUsername));
router.put('/authChangeUser', asnycHandler(userController.changePasswordByUsername));
// Delete user
router.delete('/deleteAccount/:id', asnycHandler(userController.deleteAccount));
// Select role 
router.patch('/auth/role/:id', asnycHandler(userController.editRole));


module.exports = router; 