'use strict';

const express = require("express");
const { asnycHandler } = require('./../../helpers/asyncHandler');
const { upload } = require('./../../untils/upload');
const popupControler = require('./../../controllers/popup/popup.controler');
const router = express.Router();



// Define routes
router.get('/popup', asnycHandler(popupControler.getPopup));
router.post('/popup', upload.single('popupImage'), asnycHandler(popupControler.createPopup));
router.get('/popup/:id', asnycHandler(popupControler.getPopupById));
router.put('/popup/:id', upload.single('popupImage'), asnycHandler(popupControler.updatePopup));
router.delete('/popup/:id', asnycHandler(popupControler.removePopup));

module.exports = router;