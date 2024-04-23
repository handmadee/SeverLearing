'use strict';

const express = require("express");
const { asnycHandler } = require('./../../helpers/asyncHandler');
const upload = require('./../../untils/upload');
const NewsController = require("../../controllers/news.controller");
const router = express.Router();

// Define routes
router.get('/news', asnycHandler(NewsController.getNews));
router.post('/news', upload.single('imagePost'), asnycHandler(NewsController.createNews));
router.get('/news/:id', asnycHandler(NewsController.getNewsById));
router.put('/news/:id', asnycHandler(NewsController.updateNews));
router.delete('/news/:id', asnycHandler(NewsController.removeNews));

module.exports = router;