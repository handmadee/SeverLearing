'use strict';

const express = require('express');
const InfoController = require('./../../controllers/infor.controller');
const { asnycHandler } = require('../../helpers/asyncHandler');
const { upload } = require('../../untils/upload');
const serviceAccount = require('../../configs/service.account');
const router = express.Router();


// Create User 
router.post('/demoImage', asnycHandler(async (req, res) => {
    console.log({
        message: `::: success `,
        serviceAccount
    })
    return res.json(serviceAccount)

})),
    router.post('/user', upload.single('avatar'), asnycHandler(InfoController.createInfoUser));
router.put('/user/:id', upload.single('avatar'), asnycHandler(InfoController.editInfoUser));
router.get('/user', asnycHandler(InfoController.getInfoUser));
router.delete('/user/:id', asnycHandler(InfoController.deleteInfoUser));
// GET FULL INFOR 
router.get('/InforFull', asnycHandler(InfoController.getFullInfoUser));


module.exports = router;