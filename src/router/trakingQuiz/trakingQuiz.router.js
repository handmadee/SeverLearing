const express = require("express");
const { asnycHandler } = require('./../../helpers/asyncHandler');
const { upload } = require('./../../untils/upload');
const router = express.Router();

// Import các controllers
const {
    AnswerQuizController,
    CategoryQuizControler, QuestionQuizController, QuizController,
    TrakingQuizController

} = require("../../controllers/trackingQuiz/index");

const permission = require('./../../auth/permissionApi');

// Định nghĩa các routes
// AnswerQuiz
router.get('/answerQuiz', asnycHandler(AnswerQuizController.getAnswer));
router.post('/answerQuiz', asnycHandler(AnswerQuizController.createAnswer));
router.get('/answerQuiz/:id', asnycHandler(AnswerQuizController.getAnswerbyID));
router.put('/answerQuiz/:id', asnycHandler(AnswerQuizController.updateAnswer));
router.delete('/answerQuiz/:id', asnycHandler(AnswerQuizController.removeAnswer));

// Category 
router.get('/categoryQuiz', asnycHandler(CategoryQuizControler.getCategory));
router.post('/categoryQuiz',
    upload.single('imageCategory')
    , asnycHandler(CategoryQuizControler.createCategory));
router.get('/categoryQuiz/:id', asnycHandler(CategoryQuizControler.getCategoryById));
router.put('/categoryQuiz/:id', upload.single('imageCategory'), asnycHandler(CategoryQuizControler.updateCategory));
router.delete('/categoryQuiz/:id', asnycHandler(CategoryQuizControler.removeCategory));
// Get category by level
router.get('/categoryQuiz/level/:idCategory/:level', asnycHandler(CategoryQuizControler.get));

// QuestionQuiz 
router.get('/questionQuiz', asnycHandler(QuestionQuizController.getQuestion));
router.post('/questionQuiz', upload.single('imageQuestion'), asnycHandler(QuestionQuizController.createQuestion));
router.get('/questionQuiz/:id', asnycHandler(QuestionQuizController.getQuestionById));
router.put('/questionQuiz/:id', upload.single('imageQuestion'), asnycHandler(QuestionQuizController.updateQuestion));
router.delete('/questionQuiz/:id', asnycHandler(QuestionQuizController.removeQuestion));


// Quiz
router.get('/quizExam', asnycHandler(QuizController.getCategory));
router.post('/quizExam', asnycHandler(QuizController.createCategory));
router.get('/quizExam/:id', permission(['888', '999']), asnycHandler(QuizController.getCategoryById));
router.put('/quizExam/:id', asnycHandler(QuizController.updateCategory));
router.delete('/quizExam/:id', asnycHandler(QuizController.removeCategory));
router.get('/quizExam/level/:categoryQuiz_id/:level', asnycHandler(QuizController.selectQuizByCategoryAndLevel));
router.get('/quizExam/category/:categoryQuiz_id', asnycHandler(QuizController.selectQuizByCategory));

// get Exam 
router.get('/examFull', asnycHandler(QuizController.getExam));
// TrakingQuiz
router.get('/trackingQuiz', asnycHandler(TrakingQuizController.getCategory));
router.post('/trackingQuiz', asnycHandler(TrakingQuizController.createCategory));
// router.get('/trackingQuiz/:id', asnycHandler(TrakingQuizController.getCategoryById));
router.put('/trackingQuiz/:id', asnycHandler(TrakingQuizController.updateCategory));
router.delete('/trackingQuiz/:id', asnycHandler(TrakingQuizController.removeCategory));


//  Traking 
router.post('/trackingQuiz/start', asnycHandler(TrakingQuizController.startQuiz));
router.post('/trackingQuiz/finish', asnycHandler(TrakingQuizController.finishQuiz));
router.get('/trackingQuiz/score/:userID', asnycHandler(TrakingQuizController.getScore));
router.get('/trackingQuiz/ranking', asnycHandler(TrakingQuizController.getRanking));
router.get('/trackingQuiz/ranking/week', asnycHandler(TrakingQuizController.getRankingByWeek));
// 
router.get('/trackingQuiz/ranking/user/:id', asnycHandler(TrakingQuizController.getRankingByIdUser));
// Check xem bạn đã bao nhiêu bài quiz trong 1 tháng
router.get('/trackingQuiz/checkQuizInMonth/:userID', asnycHandler(TrakingQuizController.checkQuizInMonth));

// Check user xem đã làm bao nhiêu bài quiz 
router.get('/trackingQuiz/checkQuizbyUser/:userID', asnycHandler(TrakingQuizController.checkQuizbyUser));

// Check các bài kiểm tra mà user đã làm 
router.get('/trackingQuiz/selectExam/:userID', asnycHandler(TrakingQuizController.selectTrackingQuizByUserId));

// get Exam  
router.get('/trackingQuiz/exam/:id', asnycHandler(TrakingQuizController.getUserByExam));


// Export router
module.exports = router;
