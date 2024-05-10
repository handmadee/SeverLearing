'use strict';

const express = require('express');
const permission = require('./../../auth/permission');

// chec=

const categoryController = require('../../controllers/course/category.controller');
const courseController = require('../../controllers/course/course.controler');
const chapterController = require('../../controllers/course/chapter.controller');
const lessonController = require('../../controllers/course/lesson.controller');
const quizController = require('../../controllers/course/exam.controller');
const questionController = require('../../controllers/course/question.controller');
const AnswerController = require('../../controllers/course/answer.controller');
const { asnycHandler } = require('../../helpers/asyncHandler');
const upload = require('./../../untils/upload');
const TrackingCourseController = require('../../controllers/trackingCourse/trackingCourse');
const router = express.Router();

// Category
router.post('/category', asnycHandler(categoryController.createCategory));
router.get('/category', asnycHandler(categoryController.getCategory));
router.get('/category/:id', asnycHandler(categoryController.getCategoryById));
router.put('/category/:id', asnycHandler(categoryController.updateCategory));
router.delete('/category/:id', asnycHandler(categoryController.removeCategory));


// Get Chapter
router.get('/categoryFull', asnycHandler(categoryController.getFullCategory));


// Admin page
router.post('/course', upload.single('imageCourse'), asnycHandler(courseController.createCourse));
router.get('/course', asnycHandler(courseController.getCourses));
router.get('/course/:id', asnycHandler(courseController.getCourseById));
router.put('/course/:id', upload.single('imageCourse'), asnycHandler(courseController.updateCourse));
router.delete('/course/:id', asnycHandler(courseController.removeCourse));
router.get('/search', asnycHandler(courseController.searchCourse));
router.get('/courselesson/:id', asnycHandler(courseController.getCountLesson));
router.get('/courseFull', asnycHandler(courseController.getCourseAll));



// Get Page Course 
router.get('/course/page/:page', asnycHandler(courseController.getCoursePage));


// Chapter
router.post('/chapter', asnycHandler(chapterController.createChapter));
router.get('/chapter', asnycHandler(chapterController.getChapters));
router.get('/chapter/:id', asnycHandler(chapterController.getChapterById));
router.put('/chapter/:id', asnycHandler(chapterController.updateChapter));
router.delete('/chapter/:id', asnycHandler(chapterController.removeChapter));
router.get('/chapterCourse/:id', asnycHandler(chapterController.getChapterByCourseId));

// Get Chapter
router.get('/chapterFull', asnycHandler(chapterController.getFullChapter));

// Lesson
router.post('/lesson', asnycHandler(lessonController.createLesson));
router.get('/lesson', asnycHandler(lessonController.getLessons));
router.get('/lesson/:id', asnycHandler(lessonController.getLessonById));
router.put('/lesson/:id', asnycHandler(lessonController.updateLesson));
router.delete('/lesson/:id', asnycHandler(lessonController.removeLesson));

// Quiz
router.post('/quiz', asnycHandler(quizController.createExam));
router.get('/quiz', asnycHandler(quizController.getExams));
router.get('/quiz/:id', asnycHandler(quizController.getExamById));
router.put('/quiz/:id', asnycHandler(quizController.updateExam));
router.delete('/quiz/:id', asnycHandler(quizController.removeExam));

// Question on many
router.post('/question', asnycHandler(questionController.createQuestion));
router.get('/question', asnycHandler(questionController.getQuestions));
router.get('/question/:id', asnycHandler(questionController.getQuestionById));
router.put('/question/:id', asnycHandler(questionController.updateQuestion));
router.delete('/question/:id', asnycHandler(questionController.removeQuestion));

// Asnwer on many
router.post('/answer', asnycHandler(AnswerController.createAnswer));
router.get('/answer', asnycHandler(AnswerController.getAnswers));
router.get('/answer/:id', asnycHandler(AnswerController.getAnswerById));
router.put('/answer/:id', asnycHandler(AnswerController.updateAnswer));
router.delete('/answer/:id', asnycHandler(AnswerController.removeAnswer));

// Tracking course 
router.post('/tracking', asnycHandler(TrackingCourseController.createTrackingCourse));
router.get('/tracking', asnycHandler(TrackingCourseController.getTrackingCourse));
router.get('/trackingFinish/:id', asnycHandler(TrackingCourseController.findTrackingAccountFinish));
router.get('/trackingLearn/:id', asnycHandler(TrackingCourseController.findTrackingAccountLearn));
router.put('/tracking', asnycHandler(TrackingCourseController.updateTrackingCourse));
router.get('/trackingFull', asnycHandler(TrackingCourseController.getFullTrackingCourse));

// Tracking course by id
router.get('/tracking/:id', asnycHandler(TrackingCourseController.getTrackingCourseById));

// Tracking user by id 
router.get('/trackingUser/:id', asnycHandler(TrackingCourseController.getTrackingCourseByIdUser));

// get topCourse 
router.get('/topCourse', asnycHandler(TrackingCourseController.getTopCourse));
// get lowCourse
router.get('/lowCourse', asnycHandler(TrackingCourseController.getLowCourse));




module.exports = router;