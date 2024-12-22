'use strict';

const express = require("express");
const { asnycHandler } = require('./../../helpers/asyncHandler');
const { uploadExcel } = require('./../../untils/upload');
const router = express.Router();
const languageItController = require('./../../feeback/controllers/language.controller');



router.get('/', languageItController.getAllLanguages);
router.get('/:id', languageItController.getLanguageById);
router.post('/', languageItController.createLanguage);
router.put('/:id', languageItController.updateLanguage);
router.delete('/:id', languageItController.deleteLanguage);

module.exports = router;
