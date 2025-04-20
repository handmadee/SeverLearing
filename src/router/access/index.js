

const express = require('express');
const userController = require('./../../controllers/access.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const router = express.Router();


router.post('/auth/signup', asyncHandler(userController.register));
router.post('/auth/login', asyncHandler(userController.login));
router.post('/auth/verify-token', asyncHandler(userController.verifyToken));
router.post('/auth/refresh-token', asyncHandler(userController.refreshToken));
router.post('/auth/logout', asyncHandler(userController.logout));
router.get('/auth/user/:id', asyncHandler(userController.getUser));
router.put('/auth/changePassword', asyncHandler(userController.changePassword));
router.get('/findUserName/:username', asyncHandler(userController.findUserByUsername));
router.put('/authChangeUser', asyncHandler(userController.changePasswordByUsername));
router.get('/allSupper', asyncHandler(userController.accountSupper));

// 

// Delete user
router.delete('/deleteAccount/:id', asyncHandler(userController.deleteAccount));
// Select role 
router.patch('/auth/role/:id', asyncHandler(userController.editRole));


module.exports = router; 