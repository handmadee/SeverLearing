const express = require("express");
const { asyncHandler } = require('./../../helpers/asyncHandler');
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
router.get('/answerQuiz', asyncHandler(AnswerQuizController.getAnswer));
router.post('/answerQuiz', asyncHandler(AnswerQuizController.createAnswer));
router.get('/answerQuiz/:id', asyncHandler(AnswerQuizController.getAnswerbyID));
router.put('/answerQuiz/:id', asyncHandler(AnswerQuizController.updateAnswer));
router.delete('/answerQuiz/:id', asyncHandler(AnswerQuizController.removeAnswer));

// Category 
router.get('/categoryQuiz', asyncHandler(CategoryQuizControler.getCategory));
router.post('/categoryQuiz',
    upload.single('imageCategory')
    , asyncHandler(CategoryQuizControler.createCategory));
router.get('/categoryQuiz/:id', asyncHandler(CategoryQuizControler.getCategoryById));
router.put('/categoryQuiz/:id', upload.single('imageCategory'), asyncHandler(CategoryQuizControler.updateCategory));
router.delete('/categoryQuiz/:id', asyncHandler(CategoryQuizControler.removeCategory));
// Get category by level
router.get('/categoryQuiz/level/:idCategory/:level', asyncHandler(CategoryQuizControler.get));

// QuestionQuiz 
router.get('/questionQuiz', asyncHandler(QuestionQuizController.getQuestion));
router.post('/questionQuiz', upload.single('imageQuestion'), asyncHandler(QuestionQuizController.createQuestion));
router.get('/questionQuiz/:id', asyncHandler(QuestionQuizController.getQuestionById));
router.put('/questionQuiz/:id', upload.single('imageQuestion'), asyncHandler(QuestionQuizController.updateQuestion));
router.delete('/questionQuiz/:id', asyncHandler(QuestionQuizController.removeQuestion));


// Quiz
router.get('/quizExam', asyncHandler(QuizController.getCategory));
router.post('/quizExam', asyncHandler(QuizController.createCategory));
router.get('/quizExam/:id', permission(['888', '999']), asyncHandler(QuizController.getCategoryById));
router.put('/quizExam/:id', asyncHandler(QuizController.updateCategory));
router.delete('/quizExam/:id', asyncHandler(QuizController.removeCategory));
router.get('/quizExam/level/:categoryQuiz_id/:level', asyncHandler(QuizController.selectQuizByCategoryAndLevel));
router.get('/quizExam/category/:categoryQuiz_id', asyncHandler(QuizController.selectQuizByCategory));

// get Exam 
router.get('/examFull', asyncHandler(QuizController.getExam));
// TrakingQuiz
router.get('/trackingQuiz', asyncHandler(TrakingQuizController.getCategory));
router.post('/trackingQuiz', asyncHandler(TrakingQuizController.createCategory));
// router.get('/trackingQuiz/:id', asyncHandler(TrakingQuizController.getCategoryById));
router.put('/trackingQuiz/:id', asyncHandler(TrakingQuizController.updateCategory));
router.delete('/trackingQuiz/:id', asyncHandler(TrakingQuizController.removeCategory));


//  Traking 
router.post('/trackingQuiz/start', asyncHandler(TrakingQuizController.startQuiz));
router.post('/trackingQuiz/finish', asyncHandler(TrakingQuizController.finishQuiz));
router.get('/trackingQuiz/score/:userID', asyncHandler(TrakingQuizController.getScore));
router.get('/trackingQuiz/ranking', asyncHandler(TrakingQuizController.getRanking));
router.get('/trackingQuiz/ranking/week', asyncHandler(TrakingQuizController.getRankingByWeek));
// 
router.get('/trackingQuiz/ranking/user/:id', asyncHandler(TrakingQuizController.getRankingByIdUser));
// Check xem bạn đã bao nhiêu bài quiz trong 1 tháng
router.get('/trackingQuiz/checkQuizInMonth/:userID', asyncHandler(TrakingQuizController.checkQuizInMonth));

// Check user xem đã làm bao nhiêu bài quiz 
router.get('/trackingQuiz/checkQuizbyUser/:userID', asyncHandler(TrakingQuizController.checkQuizbyUser));

// Check các bài kiểm tra mà user đã làm 
router.get('/trackingQuiz/selectExam/:userID', asyncHandler(TrakingQuizController.selectTrackingQuizByUserId));

// get Exam  
router.get('/trackingQuiz/exam/:id', asyncHandler(TrakingQuizController.getUserByExam));


// Export router
module.exports = router;
