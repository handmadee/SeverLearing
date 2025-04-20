'use strict';

const express = require("express");
const { asyncHandler } = require('./../../helpers/asyncHandler');
const { upload } = require('./../../untils/upload');
const NewsController = require("../../controllers/news.controller");
const router = express.Router();

// Define routes
router.get('/news', asyncHandler(NewsController.getNews));
router.post('/news', upload.single('imagePost'), asyncHandler(NewsController.createNews));
router.get('/news/:id', asyncHandler(NewsController.getNewsById));
router.put('/news/:id', upload.single('imagePost'), asyncHandler(NewsController.updateNews));
router.delete('/news/:id', asyncHandler(NewsController.removeNews));

module.exports = router;