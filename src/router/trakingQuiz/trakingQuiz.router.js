const express = require("express");
const { asnycHandler } = require('./../../helpers/asyncHandler');
const upload = require('./../../untils/upload');
const router = express.Router();

// Import các controllers
const {
    AnswerQuizController,
    CategoryQuizControler, QuestionQuizController, QuizController,
    TrakingQuizController

} = require("../../controllers/trackingQuiz/index");


// Định nghĩa các routes
// AnswerQuiz
router.get('/answerQuiz', asnycHandler(AnswerQuizController.getAnswer));
router.post('/answerQuiz', asnycHandler(AnswerQuizController.createAnswer));
router.get('/answerQuiz/:id', asnycHandler(AnswerQuizController.getAnswerbyID));
router.put('/answerQuiz/:id', asnycHandler(AnswerQuizController.updateAnswer));
router.delete('/answerQuiz/:id', asnycHandler(AnswerQuizController.removeAnswer));

// Category 
router.get('/categoryQuiz', asnycHandler(CategoryQuizControler.getCategory));
router.post('/categoryQuiz', asnycHandler(CategoryQuizControler.createCategory));
router.get('/categoryQuiz/:id', asnycHandler(CategoryQuizControler.getCategoryById));
router.put('/categoryQuiz/:id', asnycHandler(CategoryQuizControler.updateCategory));
router.delete('/categoryQuiz/:id', asnycHandler(CategoryQuizControler.removeCategory));

// QuestionQuiz 
router.get('/questionQuiz', asnycHandler(QuestionQuizController.getQuestion));
router.post('/questionQuiz', upload.single('imageQuestion'), asnycHandler(QuestionQuizController.createQuestion));
router.get('/questionQuiz/:id', asnycHandler(QuestionQuizController.getQuestionById));
router.put('/questionQuiz/:id', asnycHandler(QuestionQuizController.updateQuestion));
router.delete('/questionQuiz/:id', asnycHandler(QuestionQuizController.removeQuestion));

// Quiz
router.get('/quizExam', asnycHandler(QuizController.getCategory));
router.post('/quizExam', asnycHandler(QuizController.createCategory));
router.get('/quizExam/:id', asnycHandler(QuizController.getCategoryById));
router.put('/quizExam/:id', asnycHandler(QuizController.updateCategory));
router.delete('/quizExam/:id', asnycHandler(QuizController.removeCategory));

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
router.get('/trackingQuiz/ranking/user/:id', asnycHandler(TrakingQuizController.getRankingByIdUser));

module.exports = router;
