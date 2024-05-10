const express = require('express');
const InfoService = require('../../services/account/Info.service');
const CourseService = require('../../services/course/course.service');
const QuizService = require('../../services/trakingQuiz/Quiz.service');
const TrakingQuizServices = require('../../services/trakingQuiz/TrakingQuiz.services');
const categoryService = require('../../services/course/categoryCourse');
const ChapterService = require('../../services/course/chapter.service');
const categoryQuizService = require('../../services/trakingQuiz/categoryQuiz.service');
const examQuiz = require('../../services/trakingQuiz/Quiz.service');
const permission = require('../../auth/permission');
const { asnycHandler } = require('../../helpers/asyncHandler');
const authService = require('./../../services/auth/user.service');
const NewsService = require('../../services/news/news.service');
const NotificationService = require('./../../services/notification/listNotification');
const TrackingCourseService = require('../../services/trackingCourse/trackingCourse.service');
const PopupService = require('../../services/popup/popup.service');

const CourseService12 = new CourseService();
const QuizService12 = new QuizService();
const trakingQuizServices = new TrakingQuizServices();
const trackingCourse = new TrackingCourseService();
const categoryCourse = new categoryService();
const chapterCourse = new ChapterService();
const categoryQuiz = new categoryQuizService();
const examQuizService = new examQuiz();
const newsService = new NewsService();
const adminRouter = express.Router();
const popupService = new PopupService();

// Auth
adminRouter.get('/auth', asnycHandler(async (req, res) => {
    res.render('admin/authAdmin');
}));

// Dashboard 
adminRouter.get('/dashboard', permission('999'), asnycHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const [data, course, quiz, totalItems, news, rank] = await Promise.all([
        TrackingCourseService.getTrackingCourseTopCourse(),
        CourseService12.countCourses(),
        QuizService12.countQuiz(),
        InfoService.countUsers(),
        newsService.getCountNews(),
        trakingQuizServices.getRankingTop10(),


    ]);

    const totalPages = Math.ceil(totalItems / limit);
    if (!data) throw new Error('No data found');

    res.render('admin/dashboard', { title: "Trang chủ", data, currentPage: page, totalPages, course, quiz, totalItems, news, rank })
}));

// Exam
adminRouter.get('/exam', permission('999'), asnycHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const quizsWithCount = await QuizService12.getExamAdmin(page, limit);
    const totalItems = quizsWithCount[0].totalQuizs;
    const totalPages = Math.ceil(totalItems / limit);
    if (!quizsWithCount) throw new Error('No data found');
    res.render('admin/exam', { title: "Quản lý bài kiểm tra", quizsWithCount, totalPages, currentPage: page, totalItems });
}));

// Create Exam category
adminRouter.get('/exam/category/create', permission('999'), asnycHandler(async (req, res) => {
    res.render('admin/createCategoryQuiz', { title: "Tạo danh mục game" });
}));

// Create Exam Quiz
adminRouter.get('/exam/quiz/create', permission('999'), asnycHandler(async (req, res) => {
    const quiz = await examQuizService.getAll();
    const game = await categoryQuiz.getAll();
    if (!quiz || !game) throw new Error('No data found');
    res.render('admin/createExamQuestion', { title: "Tạo bài kiểm tra", quiz, game });
}));

// Question Exam 
adminRouter.get('/exam/question/view/:id', permission('999'), asnycHandler(async (req, res) => {
    const id = req.params.id;
    const exam = await examQuizService.getQuizById(id);
    if (!exam) throw new Error('No data found');
    const examTitle = exam?.title;
    const data = exam?.questionQuiz;
    console.log(data)
    res.render('admin/questionExam',
        {
            title: "Tạo bài kiểm tra",
            data,
            examTitle
        });
}));

// View Exam 
adminRouter.get('/exam/category', permission('999'), asnycHandler(async (req, res) => {
    const data = await categoryQuiz.getAll();
    if (!data) throw new Error('No data found');
    res.render('admin/categoryGame', { title: "Tạo danh mục khoá học", data });
}));

// Students
adminRouter.get('/students', permission('999'), asnycHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await InfoService.getInfoFullPage(page, limit);
    const totalItems = data?.total;
    const totalPages = Math.ceil(totalItems / limit);
    if (!data) throw new Error('No data found');
    res.render('admin/students', { title: "Quản lý học sinh", data: data?.data, totalPages, currentPage: page, totalItems });
}));

// Course
adminRouter.get('/course', permission('999'), asnycHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await CourseService12.getPageCourse(page, limit);
    const totalItems = data?.totalCourses;
    const totalPages = Math.ceil(totalItems / limit);
    if (!data) throw new Error('No data found');
    res.render('admin/course', { title: "Quản lý khoá học", data: data?.courses, totalPages, currentPage: page, totalItems });
}));

// view lesson course 
adminRouter.get('/course/lesson/find/:id', asnycHandler(async (req, res) => {
    const courseid = req.params.id;
    const rp = await CourseService12.findCourseByCategory(courseid);
    if (!rp) throw new Error('No data found');
    const courseName = rp?.title;
    const data = rp?.chapters;
    const dataLesson = rp?.chapters?.lessons;
    console.log(dataLesson)
    res.render('admin/lesson', { title: "Quản lý bài học", data, dataLesson, courseName, courseid });
}));
// Create Course & Category Course
adminRouter.get('/course/create', permission('999'), asnycHandler(async (req, res) => {
    const category = await categoryCourse.getAll();
    if (!category) throw new Error('No data found');
    res.render('admin/createCourse', { title: "Tạo khoá học", category });
}));
// Create category
adminRouter.get('/course/category', permission('999'), asnycHandler(async (req, res) => {
    const data = await categoryCourse.getAll();
    if (!data) throw new Error('No data found');
    res.render('admin/categoryCourse', { title: "Tạo danh mục khoá học", data });
}));

// Create Exam 
adminRouter.get('/course/exam/create', permission('999'), asnycHandler(async (req, res) => {
    const course = await CourseService12.getCourseByChapter();
    const chapter = await chapterCourse.getChapterFull();
    if (!chapter || !course) throw new Error('No data found');
    res.render('admin/createExamCourse', { title: "Tạo bài kiểm tra", chapter, course });
}));

// Create Lesson
adminRouter.get('/course/lesson/create', permission('999'), asnycHandler(async (req, res) => {
    const course = await CourseService12.getCourseByChapter();
    if (!course) throw new Error('No data found');
    res.render('admin/createLessonCourse', { title: "Tạo video", course });
}));

// Rank
adminRouter.get('/rank', permission('999'), asnycHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await trakingQuizServices.getRanking(page, limit);
    const totalItems = data?.totalItems;
    const totalPages = Math.ceil(totalItems / limit);
    if (!data) throw new Error('No data found');
    res.render('admin/rank', { title: "Xếp hạng toàn bộ thời gian", data: data?.rank, totalPages, currentPage: page, totalItems });
}));
// View 

// Rank in month
adminRouter.get('/rank/inMonth', permission('999'), asnycHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await trakingQuizServices.getRankingByMonthPage(page, limit);
    const totalItems = data?.totalItems;
    const totalPages = Math.ceil(totalItems / limit);
    if (!data) throw new Error('No data found');
    res.render('admin/rank', { title: "Xếp hạng trong tháng", data: data?.rank, totalPages, currentPage: page, totalItems });
}));

// Rank in week
adminRouter.get('/rank/inWeek', permission('999'), asnycHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await trakingQuizServices.getRankingByWeekPage(page, limit);
    const totalItems = data?.totalItems;
    const totalPages = Math.ceil(totalItems / limit);
    if (!data) throw new Error('No data found');
    res.render('admin/rank', { title: "Xếp hạng trong tuần", data: data?.rank, totalPages, currentPage: page, totalItems });
}));

// News 
adminRouter.get('/news', permission('999'), asnycHandler(async (req, res) => {
    const data = await newsService.getAll();
    if (!data) throw new Error('No data found');
    res.render('admin/news', { title: "Quản lý tin tức", data: data });
}));
// Create news 
adminRouter.get('/news/create', permission('999'), asnycHandler(async (req, res) => {
    res.render('admin/createNews', { title: "Tạo tin tức" });
}));

// Popup 
adminRouter.get('/popup', permission('999'), asnycHandler(async (req, res) => {
    const data = await popupService.getAll();
    if (!data) throw new Error('No data found');
    res.render('admin/popup', { title: "Quản lý popup ", data: data });
}));
// Create popup
adminRouter.get('/popup/create', permission('999'), asnycHandler(async (req, res) => {
    res.render('admin/createPopup', { title: "Tạo popup " });
}));

// notification
adminRouter.get('/slider', permission('999'), asnycHandler(async (req, res) => {
    const data = await NotificationService.getNotificationFull();
    if (!data) throw new Error('No data found');
    res.render('admin/slider', { title: "Quản lý slider", data: data });
}));

// Create Slider 
adminRouter.get('/slider/create', permission('999'), asnycHandler(async (req, res) => {
    res.render('admin/createSlider', { title: "Tạo slider" });
}));

// Errors
adminRouter.get('/404', (req, res) => {
    res.render('errors/404', { title: "404  - Not found" });
});
adminRouter.get('/403', (req, res) => {
    res.render('errors/403', { title: "403  - Forbidden" });
});

// Settings
adminRouter.get('/settings', (req, res) => {
    res.render('admin/settings');
});

// Notification


module.exports = adminRouter;
