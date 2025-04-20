const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const examController = require('../controllers/exam.controller');
const historyExamControler = require('../controllers/historyExam.controler');
const router = express.Router();


router.post('/', asyncHandler(examController.createdExam));
router.get('/', asyncHandler(examController.getAllExam));
router.get('/find/:id', asyncHandler(examController.getExamById))
router.post('/check-exam', asyncHandler(examController.checkStartExamById))
router.post('/start', asyncHandler(examController.checkStartExamById))
router.patch('/:id', asyncHandler(examController.updateExam));
router.patch('/change/:id', asyncHandler(examController.changeExam));
router.delete('/:id', asyncHandler(examController.delExam))
// History 
router.post('/submit', asyncHandler(historyExamControler.createdHistoryExam));
router.get('/history/exam/:id', asyncHandler(historyExamControler.getHistoryByExamId));
router.get('/history/result/:studentId/:examId?', asyncHandler(historyExamControler.getResuftExamByStudentId));


module.exports = router;