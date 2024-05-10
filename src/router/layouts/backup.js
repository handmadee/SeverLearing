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
const CourseService12 = new CourseService();
const QuizService12 = new QuizService();
const trakingQuizServices = new TrakingQuizServices();
const categoryCourse = new categoryService();
const chapterCourse = new ChapterService();
const categoryQuiz = new categoryQuizService();
const examQuizService = new examQuiz();




const adminRouter = express.Router();

// Auth
adminRouter.get('/auth', async (req, res) => {
    res.render('admin/authAdmin')
});

// Dashboard 
adminRouter.get('/dashboard', permission('999'), async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    try {
        const [data, course, quiz, totalItems, rank] = await Promise.all([
            InfoService.getInfoUser(page, limit),
            CourseService12.countCourses(),
            QuizService12.countQuiz(),
            InfoService.countUsers(),
            trakingQuizServices.getRankingTop10()
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        if (data) {
            res.render('admin/dashboard', { title: "Trang chủ", data, currentPage: page, totalPages, course, quiz, totalItems, rank });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.log(error)
        console.error(error);
        // next(error);
    }
});

// Exam
adminRouter.get('/exam', permission('999'), async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const quizsWithCount = await QuizService12.getExamAdmin(page, limit);
    const totalItems = quizsWithCount[0].totalQuizs;
    const totalPages = Math.ceil(totalItems / limit);
    try {
        if (quizsWithCount) {
            res.render('admin/exam', { title: "Quản lý bài kiểm tra", quizsWithCount, totalPages, currentPage: page, totalItems });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Create Exam category
adminRouter.get('/exam/category/create', permission('999'), async (req, res) => {
    res.render('admin/createCategoryQuiz', { title: "Tạo danh mục game" })
});
// Create Exam Quiz
adminRouter.get('/exam/quiz/create', permission('999'), async (req, res) => {
    try {
        const quiz = await examQuizService.getAll();
        const game = await categoryQuiz.getAll();
        if (quiz && game) {
            res.render('admin/createExamQuestion', { title: "Tạo bài kiểm tra", quiz, game });
        }
    } catch (error) {
        throw new Error('No data found');
    }

});
// Students
adminRouter.get('/students', permission('999'), async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await InfoService.getInfoFullPage(page, limit);
    const totalItems = data?.total;
    const totalPages = Math.ceil(totalItems / limit);
    try {
        console.log(data)
        if (data) {
            res.render('admin/students', {
                title: "Quản lý học sinh", data: data?.data, totalPages, currentPage: page, totalItems
            });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});
// Course
adminRouter.get('/course', permission('999'), async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await CourseService12.getPageCourse(page, limit);
    const totalItems = data?.totalCourses;
    const totalPages = Math.ceil(totalItems / limit);
    try {
        console.log(data)
        if (data) {
            res.render('admin/course', {
                title: "Quản lý khoá học", data: data?.courses, totalPages, currentPage: page, totalItems
            });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});
// Create Course & Category Course
adminRouter.get('/course/create', permission('999'), async (req, res) => {
    try {
        const category = await categoryCourse.getAll();
        if (category) {
            console.log(category)
            res.render('admin/createCourse', {
                title: "Tạo khoá học", category
            });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});
// Create Exam 
adminRouter.get('/course/exam/create', permission('999'), async (req, res) => {
    try {
        const course = await CourseService12.getCourseByChapter();
        const chapter = await chapterCourse.getChapterFull();


        console.log(chapter)
        if (chapter && course) {
            res.render('admin/createExamCourse', {
                title: "Tạo bài kiểm tra", chapter, course
            });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }


});
// Create Lesson
adminRouter.get('/course/lesson/create', permission('999'), async (req, res) => {
    try {
        const course = await CourseService12.getCourseByChapter();
        if (course) {
            res.render('admin/createLessonCourse', {
                title: "Tạo video", course
            });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }


});
// Rank
adminRouter.get('/rank', permission('999'), async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await trakingQuizServices.getRanking(page, limit);
    const totalItems = data?.totalItems;
    const totalPages = Math.ceil(totalItems / limit);

    try {
        if (data) {
            res.render('admin/rank', {
                title: "Xếp hạng toàn bộ thời gian", data: data?.rank, totalPages, currentPage: page, totalItems,
            });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});
// Rank in month
adminRouter.get('/rank/inMonth', permission('999'), async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await trakingQuizServices.getRankingByMonthPage(page, limit);
    const totalItems = data?.totalItems;
    const totalPages = Math.ceil(totalItems / limit);
    try {
        if (data) {
            res.render('admin/rank', {
                title: "Xếp hạng trong tháng", data: data?.rank, totalPages, currentPage: page, totalItems

            });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

adminRouter.get('/rank/inWeek', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const data = await trakingQuizServices.getRankingByWeekPage(page, limit);
    const totalItems = data?.totalItems;
    const totalPages = Math.ceil(totalItems / limit);
    try {
        if (data) {
            res.render('admin/rank', {
                title: "Xếp hạng trong tuần", data: data?.rank, totalPages, currentPage: page, totalItems
            });
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// News 

adminRouter.get('/news', (req, res) => {
    res.render('admin/news', {
        title: "Quản lý tin tức"
    });
})







// Errors
adminRouter.get('/404', (req, res) => {
    res.render('errors/404', {
        title: "404  - Not found"
    });
});
// 403 - Forbidden
adminRouter.get('/403', (req, res) => {
    res.render('errors/403', {
        title: "403  - Forbidden"
    });
});



// Create 


// 
adminRouter.get('/settings', (req, res) => { res.render('admin/settings'); });
module.exports = adminRouter;
