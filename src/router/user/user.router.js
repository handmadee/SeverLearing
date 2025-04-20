'use strict';

const express = require('express');
const InfoController = require('./../../controllers/infor.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { upload } = require('../../untils/upload');
const serviceAccount = require('../../configs/service.account');
const router = express.Router();


// Create User 
router.post('/demoImage', asyncHandler(async (req, res) => {
    console.log({
        message: `::: success `,
        serviceAccount
    })
    return res.json(serviceAccount)

})),
    router.post('/user', upload.single('avatar'), asyncHandler(InfoController.createInfoUser));
router.put('/user/:id', upload.single('avatar'), asyncHandler(InfoController.editInfoUser));
router.get('/user', asyncHandler(InfoController.getInfoUser));
router.delete('/user/:id', asyncHandler(InfoController.deleteInfoUser));
// GET FULL INFOR 
router.get('/InforFull', asyncHandler(InfoController.getFullInfoUser));


module.exports = router;