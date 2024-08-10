const express = require('express');
const jwt = require('jsonwebtoken');
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
const NewsService = require('../../services/news/news.service');
const NotificationService = require('./../../services/notification/listNotification');
const TrackingCourseService = require('../../services/trackingCourse/trackingCourse.service');
const PopupService = require('../../services/popup/popup.service');
const fireBaseNotification = require('./../../services/firebase/notification.firebase.services');
const fcmTokenService = require('../../services/firebase/fcmToken.firebase.services');
const scheduleService = require('../../services/schedule/schedule.service');
const AccountService = require('../../services/account/account.service');
const ClassService = require('../../services/schedule/class.services');





const CourseService12 = new CourseService();
const QuizService12 = new QuizService();
const trakingQuizServices = new TrakingQuizServices();
const categoryCourse = new categoryService();
const chapterCourse = new ChapterService();
const categoryQuiz = new categoryQuizService();
const examQuizService = new examQuiz();
const newsService = new NewsService();
const adminRouter = express.Router();
const popupService = new PopupService();
const notificationService = new fireBaseNotification();
const fcmDevice = new fcmTokenService();

// Auth
adminRouter.get('/auth', (req, res, next) => {
    try {
        const token = req.cookies['accessToken'];
        if (!token) {
            next();
        } else {
            const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log(payload)
            if (payload.role.includes('999')) {
                return res.redirect('/admin/dashboard');
            } else {
                next();
            }
        }
    } catch (err) {
        console.log(err)
    }
}, asnycHandler(async (req, res) => {
    res.render('admin/authAdmin');
}));

// viewAccout 
adminRouter.get('/selectAccout', asnycHandler(async (req, res) => {
    const arAccout = await AccountService.accountSupper();
    console.log({
        messaging: 'Accout ::',
        arAccout
    })
    res.json({
        arAccout
    })
}
));

// 

// Create account 
adminRouter.get('/students/create', permission('999'), asnycHandler(async (req, res) => {
    const data = await AccountService.accountSupper();
    res.render('admin/createAccount', { title: "Tạo tài khoản", data });
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
    const totalItems = quizsWithCount.length > 0 ?
        quizsWithCount[0].totalQuizs : 0;
    const totalPages = Math.ceil(totalItems / limit);
    if (!quizsWithCount) throw new Error('No data found');
    // 
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



// Exam by id 
adminRouter.get('/exam/tracking/:id/:max', permission('999'), asnycHandler(async (req, res) => {
    const currentPage = parseInt(req.query.page) || 1;
    const limit = 10;
    const id = req.params.id;
    const max = req.params.max;
    const data = await trakingQuizServices.getUserByExam(id, currentPage, limit);
    const totalItem = data?.totalItems;
    const totalPages = Math.ceil(totalItem / limit);
    console.log(data)
    if (!data) throw new Error('No data found');
    res.render('admin/examRank', { title: "Quản lý bài kiểm tra", TrackingExam: data?.rank, totalPages, currentPage, max, id });
}))

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
    res.render('admin/rank', { title: "Xếp hạng toàn bộ thời gian", data: data?.rank, totalPages, currentPage: page, totalItems, page1: 1 });
}));

// Rank in month
adminRouter.get('/rank/inMonth', permission('999'), asnycHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await trakingQuizServices.getRankingByMonthPage(page, limit);
    const totalItems = data?.totalItems;
    const totalPages = Math.ceil(totalItems / limit);
    if (!data) throw new Error('No data found');
    res.render('admin/rank', { title: "Xếp hạng trong tháng", data: data?.rank, totalPages, currentPage: page, totalItems, page1: 2 });
}));

// Rank in week
adminRouter.get('/rank/inWeek', permission('999'), asnycHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await trakingQuizServices.getRankingByWeekPage(page, limit);
    const totalItems = data?.totalItems;
    const totalPages = Math.ceil(totalItems / limit);
    if (!data) throw new Error('No data found');
    res.render('admin/rank', { title: "Xếp hạng trong tuần", data: data?.rank, totalPages, currentPage: page, totalItems, page1: 3 });
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


// Firebase Services

//+ 1 Notification 
adminRouter.get('/firebase/notification', permission('999'), asnycHandler(async (req, res) => {
    // FcmToken
    const currentPage = parseInt(req.query.page) || 1;
    const fcmToken = await fcmDevice.getAllFcmToken(currentPage, 10);
    const totalPages = fcmToken?.countPage;
    const data = fcmToken?.data;
    console.log(data)
    res.render('admin/createSendNotification', { title: "Tạo thông báo", data, currentPage, totalPages });
}));
// Schedule Notification
// hiển thị chiến dịch
adminRouter.get('/firebase/scheduleNotification', permission('999'), asnycHandler(async (req, res) => {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const jobs = await notificationService.getAllJobs(limit, page);
    const data = jobs?.jobs;
    const totalItems = jobs?.totalJobs;
    const totalPages = Math.ceil(totalItems / limit);
    res.render('admin/viewNotification', { title: "Lên lịch thông báo", data, currentPage: page, totalPages });
}));


// Schedule students
adminRouter.get('/schedule/importStudents', permission('999'), asnycHandler(async (req, res) => {
    const currentPage = parseInt(req.query.page) || 1;
    // const data = await scheduleService.getAllShechedule(currentPage, 10);
    let data;
    const keyword = req.query.qkeyword;
    console.log({
        message: 'yes',
        response: keyword
    });

    if (keyword) {
        data = await scheduleService.searchStudents(keyword);
    } else {
        data = await scheduleService.getAllShechedule(currentPage, 10);
    }
    console.log({
        message: `[Account] :: `,
        data: data
    })
    const total = data?.total || 0;
    const totalPages = data?.totalPages;
    res.render('./admin/shechedule/importSchedule', { title: "Đăng tải học sinh", data: data?.data, totalPages, currentPage, total });
}));
adminRouter.get('/schedule/ettendanceTeacher', permission('999'), asnycHandler(async (req, res) => {
    // const data = await AccountService.selectTeachers();
    const data = await AccountService.accountSupper();
    res.render('./admin/shechedule/exportTeacher', { title: "Lịch giảng viên", data });
}))
adminRouter.get('/schedule/findShechedule', permission('999'), asnycHandler(async (req, res) => {
    res.render('./admin/shechedule/findShechedule', { title: "Tìm kiếm thời khoá biểu " });
}));
adminRouter.get('/schedule/exportShechedule', permission('999'), asnycHandler(async (req, res) => {
    res.render('./admin/shechedule/exportShechedule', { title: "Xuất thời khoá biểu" });
}));

adminRouter.get('/schedule/teacherSheduleV1', permission('789 999'), asnycHandler(async (req, res) => {
    const date = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    const days = new Date().getDay() == 0 ? 8 : new Date().getDay() + 1;
    const { userId } = req.payload;
    console.log({
        message: 'user:: id',
        userId
    })
    res.render('./admin/shechedule/teacherShedule', { title: "Điểm danh", date, days, userId });
}));
adminRouter.get('/schedule/teacherShedule', permission('789 999'), asnycHandler(async (req, res) => {
    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const date = `${new Date(now).getDate()}-${new Date(now).getMonth() + 1}-${new Date(now).getFullYear()}`;
    const days = new Date().getDay() == 0 ? 8 : new Date().getDay() + 1;
    const data = await AccountService.accountSupper();
    const { userId, role } = req.payload;
    console.log({
        message: 'user:: id',
        userId
    })
    res.render('./admin/shechedule/teacherSheduleV2', { title: "Điểm danh", date, days, userId, data, role });
}));
// @Role Teacher    
adminRouter.get('/teacher/teacherShedule', permission('789 999'), asnycHandler(async (req, res) => {
    const date = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    const days = new Date().getDay() == 0 ? 8 : new Date().getDay() + 1;
    const data = await AccountService.accountSupper();
    const { userId, role } = req.payload;
    res.render('./admin/shechedule/teacherSheduleV2', { title: "Điểm danh", date, days, userId, data, role });
}));



adminRouter.get('/teacher/changeSub', permission('789 999'), asnycHandler(async (req, res) => {
    res.render('./admin/teacher/changeSub', { title: "Tìm kiếm thời khoá biểu " });
}));


// Parents
adminRouter.get('/parents', asnycHandler(async (req, res) => {
    res.render('./admin/Parents', { title: "Phu huynh " });
}));

adminRouter.get('/parents/students/:id', asnycHandler(async (req, res) => {
    const idStudents = req.params.id;
    const students = await scheduleService.getById(idStudents);
    /*

_id: "66936327a1c8c5dd16110d36",
fullname: "Nguyễn Tiến Minh 2",
phone: "0387611812",
study: 1,
days: [
2,
8
],
    */
    const ClassInStudesnt = await ClassService.findStudentsByClass(idStudents)
    /*
    [
{
_id: "66b28892dd6cedafafe5ad33",
nameClass: "MD183009",
teacherAccount: {
_id: "669362fda1c8c5dd16110d2e",
username: "admin@gmail.com"
},
study: 1,
days: [
2
]
}
]
   */
    // res.send(students)

    // id 
    res.render('./admin/studentsParents', { title: "Phu huynh ", idStudents, students, ClassInStudesnt });
}));


// Class
adminRouter.get('/class', asnycHandler(async (req, res) => {
    const data = await AccountService.accountSupper();
    const listStudent = await scheduleService.getAllStudents();
    console.log(listStudent)
    res.render('./admin/createClass', { title: "Tạo lớp học", data, listStudent });
}));

// Select Class 
adminRouter.get('/viewClass', permission('789 999'), asnycHandler(async (req, res) => {
    const data = await AccountService.accountSupper();
    const { userId, role } = req.payload;
    res.render('./admin/class/viewClass', { title: "Phu huynh ", data, userId, role });
}));


// Select Class 
adminRouter.get('/feedBack', permission(' 999'), asnycHandler(async (req, res) => {
    const data = await AccountService.accountSupper();
    const { userId } = req.payload;
    res.render('./admin/shechedule/feedBack', { title: "Danh sách feedback từ giáo viên ", data, userId });
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
