'use strict';

const express = require('express');
const permission = require('./../../auth/permissionApi');

// chec

const categoryController = require('../../controllers/course/category.controller');
const courseController = require('../../controllers/course/course.controler');
const chapterController = require('../../controllers/course/chapter.controller');
const lessonController = require('../../controllers/course/lesson.controller');
const quizController = require('../../controllers/course/exam.controller');
const questionController = require('../../controllers/course/question.controller');
const AnswerController = require('../../controllers/course/answer.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { upload } = require('./../../untils/upload');
const TrackingCourseController = require('../../controllers/trackingCourse/trackingCourse');
const router = express.Router();

// Category
router.post('/category', asyncHandler(categoryController.createCategory));
router.get('/category', asyncHandler(categoryController.getCategory));
router.get('/category/:id', asyncHandler(categoryController.getCategoryById));
router.put('/category/:id', asyncHandler(categoryController.updateCategory));
router.delete('/category/:id', asyncHandler(categoryController.removeCategory));

// Get Chapter
router.get('/categoryFull', asyncHandler(categoryController.getFullCategory));


// Admin page
router.post('/course', upload.single('imageCourse'), asyncHandler(courseController.createCourse));
router.get('/course', asyncHandler(courseController.getCourses));
// Check permission course 
router.get('/course/:id', permission(['888', '999']), asyncHandler(courseController.getCourseById));
router.put('/course/:id', upload.single('imageCourse'), asyncHandler(courseController.updateCourse));
router.delete('/course/:id', asyncHandler(courseController.removeCourse));
router.get('/search', asyncHandler(courseController.searchCourse));
router.get('/courselesson/:id', asyncHandler(courseController.getCountLesson));
router.get('/courseFull', asyncHandler(courseController.getCourseAll));



// Get Page Course 
router.get('/course/page/:page', asyncHandler(courseController.getCoursePage));


// Chapter
router.post('/chapter', asyncHandler(chapterController.createChapter));
router.get('/chapter', asyncHandler(chapterController.getChapters));
router.get('/chapter/:id', asyncHandler(chapterController.getChapterById));
router.put('/chapter/:id', asyncHandler(chapterController.updateChapter));
router.delete('/chapter/:id', asyncHandler(chapterController.removeChapter));
router.get('/chapterCourse/:id', asyncHandler(chapterController.getChapterByCourseId));

// Get Chapter
router.get('/chapterFull', asyncHandler(chapterController.getFullChapter));

// Lesson
router.post('/lesson', asyncHandler(lessonController.createLesson));
router.get('/lesson', asyncHandler(lessonController.getLessons));
router.get('/lesson/:id', asyncHandler(lessonController.getLessonById));
router.put('/lesson/:id', asyncHandler(lessonController.updateLesson));
router.delete('/lesson/:id', asyncHandler(lessonController.removeLesson));

// Quiz
router.post('/quiz', asyncHandler(quizController.createExam));
router.get('/quiz', asyncHandler(quizController.getExams));
router.get('/quiz/:id', asyncHandler(quizController.getExamById));
router.put('/quiz/:id', asyncHandler(quizController.updateExam));
router.delete('/quiz/:id', asyncHandler(quizController.removeExam));

// Question on many
router.post('/question', asyncHandler(questionController.createQuestion));
router.get('/question', asyncHandler(questionController.getQuestions));
router.get('/question/:id', asyncHandler(questionController.getQuestionById));
router.put('/question/:id', asyncHandler(questionController.updateQuestion));
router.delete('/question/:id', asyncHandler(questionController.removeQuestion));

// Asnwer on many
router.post('/answer', asyncHandler(AnswerController.createAnswer));
router.get('/answer', asyncHandler(AnswerController.getAnswers));
router.get('/answer/:id', asyncHandler(AnswerController.getAnswerById));
router.put('/answer/:id', asyncHandler(AnswerController.updateAnswer));
router.delete('/answer/:id', asyncHandler(AnswerController.removeAnswer));

// Tracking course 
router.post('/tracking', permission('888', '999'), asyncHandler(TrackingCourseController.createTrackingCourse));
router.get('/tracking', asyncHandler(TrackingCourseController.getTrackingCourse));
router.get('/trackingFinish/:id', asyncHandler(TrackingCourseController.findTrackingAccountFinish));
router.get('/trackingLearn/:id', asyncHandler(TrackingCourseController.findTrackingAccountLearn));
router.put('/tracking', asyncHandler(TrackingCourseController.updateTrackingCourse));
router.get('/trackingFull', asyncHandler(TrackingCourseController.getFullTrackingCourse));

// Tracking course by id
router.get('/tracking/:id', asyncHandler(TrackingCourseController.getTrackingCourseById));

// Tracking user by id 
router.get('/trackingUser/:id', asyncHandler(TrackingCourseController.getTrackingCourseByIdUser));

// get topCourse 
router.get('/topCourse', asyncHandler(TrackingCourseController.getTopCourse));
// get lowCourse
router.get('/lowCourse', asyncHandler(TrackingCourseController.getLowCourse));




module.exports = router;