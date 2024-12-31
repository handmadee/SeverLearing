const express = require('express');
const { asnycHandler } = require('../../helpers/asyncHandler');
const examController = require('../controllers/exam.controller');
const historyExamControler = require('../controllers/historyExam.controler');
const router = express.Router();


router.post('/', asnycHandler(examController.createdExam));
router.get('/', asnycHandler(examController.getAllExam));
router.get('/find/:id', asnycHandler(examController.getExamById))
router.post('/check-exam', asnycHandler(examController.checkStartExamById))
router.post('/start', asnycHandler(examController.checkStartExamById))
router.patch('/:id', asnycHandler(examController.updateExam));
router.patch('/change/:id', asnycHandler(examController.changeExam));
router.delete('/:id', asnycHandler(examController.delExam))
// History 
router.post('/submit', asnycHandler(historyExamControler.createdHistoryExam));
router.get('/history/exam/:id', asnycHandler(historyExamControler.getHistoryByExamId));
router.get('/history/result/:studentId/:examId?', asnycHandler(historyExamControler.getResuftExamByStudentId));


module.exports = router;