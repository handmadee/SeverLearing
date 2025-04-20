'use strict';

const express = require("express");
const { asyncHandler } = require('./../../helpers/asyncHandler');
const { upload } = require('./../../untils/upload');
const popupControler = require('./../../controllers/popup/popup.controler');
const router = express.Router();



// Define routes
router.get('/popup', asyncHandler(popupControler.getPopup));
router.post('/popup', upload.single('popupImage'), asyncHandler(popupControler.createPopup));
router.get('/popup/:id', asyncHandler(popupControler.getPopupById));
router.put('/popup/:id', upload.single('popupImage'), asyncHandler(popupControler.updatePopup));
router.delete('/popup/:id', asyncHandler(popupControler.removePopup));

module.exports = router;