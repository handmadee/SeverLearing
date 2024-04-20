const CourseController = require("../../controllers/course/course.controler");
const { BadRequestError } = require("../../core/error.response");
const accountModel = require("../../models/account.model");
const chapterModel = require("../../models/chapter.model");
const courseModel = require("../../models/course.model");
const lessonModel = require("../../models/lesson.model");
const historyCourseModel = require("../../models/traking /historyCourse.model");
const CourseService = require("../course/course.service");


class TrackingCourseService {
    static async startCourse(data) {
        const { idAccount, idCourse } = data;
        const isStart = await historyCourseModel.findOne({ userID: idAccount, courseID: idCourse });
        if (isStart) throw new BadRequestError('Course is started');
        const account = await accountModel.findById(idAccount);
        const course = await courseModel.findById(idCourse);
        if (!account || !course) throw new BadRequestError('Account or course not found');
        const historyCourse = await historyCourseModel.create({ userID: idAccount, courseID: idCourse });
        return historyCourse;
    }

    static async updateProgress(idAccount, idCourse, idLesson) {
        const historyCourse = await historyCourseModel.findOne({ userID: idAccount, courseID: idCourse });
        if (!historyCourse) {
            throw new BadRequestError('Không tìm thấy lịch sử khóa học');
        }
        historyCourse.learnedLessons.push(idLesson);
        historyCourse.lastLessonCompleted = idLesson;
        historyCourse.completedLessonsCount += 1;
        await historyCourse.save();
        return historyCourse;
    }


    static async addLessonToHistory(userId, courseId, lessonId) {
        const history = await historyCourseModel.findOne({ userID: userId, courseID: courseId }).populate({ path: 'courseID', select: 'totalLesson' });

        if (!history) {
            return res.status(404).send('History not found');
        }
        if (!history.learnLesson.includes(lessonId)) {
            history.learnLesson.push(lessonId);
            history.completedLessonsCount++;
            history.lastLessonCompleted = lessonId;
            history.statusCourse = history.completedLessonsCount === history.courseID.totalLesson ? 'finish' : 'learning';
            await history.save();
        } else {
            throw new BadRequestError('Lesson learn already');
        }
        return history;
    }

    static async lessonLearned(idAccount, idCourse) {
        const historyCourse = await historyCourseModel.findOne({ userID: idAccount, courseID: idCourse });
        if (!historyCourse) {
            throw new BadRequestError('Không tìm thấy lịch sử khóa học');
        }


        // Đây là danh sách tổng số bài học trong khoá học 

        // const chapter = await chapterModel.find(
        //     {
        //         courseId: idCourse
        //     }
        // ).select('lessons');
        // let groupedLessons = chapter.flatMap(chapter => chapter.lessons);



        // Return course details, chapters and marked lessons
        return historyCourse;
    }
    static async getLessonHistoryCourse(idAccount, idCourse) {
        const historyCourse = await historyCourseModel.findOne({ userID: idAccount, courseID: idCourse }).select('learnLesson  statusCourse completedLessonsCount lastLessonCompleted');
        if (!historyCourse) {
            throw new BadRequestError('Không tìm thấy lịch sử khóa học');
        }
        const chapter = await chapterModel.find(
            {
                courseId: idCourse
            }
        ).select('lessons');
        let groupedLessons = chapter.flatMap(chapter => chapter.lessons);
        return {
            totalLessons: groupedLessons.length,
            trackingCourse: historyCourse
        };
    }

    static async getTrackingCourseLearn(idAccount) {
        const historyCourse = await historyCourseModel.find({ userID: idAccount, statusCourse: 'learning' }).populate('courseID', 'title  imageCourse totalLesson').select('learnLesson  statusCourse completedLessonsCount lastLessonCompleted');
        return historyCourse;
    }


    static async getTrackingCourseFinish(idAccount) {
        const historyCourse = await historyCourseModel.find({ userID: idAccount, statusCourse: 'finish' }).populate('courseID', 'title  imageCourse totalLesson').select('learnLesson  statusCourse completedLessonsCount lastLessonCompleted updatedAt');
        return historyCourse;
    }

    // TrakingFull 
    static async getTrackingCourseFull(idAccount) {
        const historyCourse = await historyCourseModel.find().populate('userID courseID learnLesson');
        return historyCourse;
    }
}
module.exports = TrackingCourseService;