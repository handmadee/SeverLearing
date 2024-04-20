

const { Created, OK } = require("../../core/success.response");
const TrackingCourseService = require("../../services/trackingCourse/trackingCourse.service");

class TrackingCourseController {
    static async createTrackingCourse(req, res) {
        const trackingCourse = await TrackingCourseService.startCourse(req.body);
        return new Created({
            message: "Đã thêm khoá học vào thành công",
            data: trackingCourse
        }).send(res);
    }

    static async getTrackingCourse(req, res) {
        const { idAccount, idCourse } = req.query;
        console.log({
            req: idAccount
        })
        const trackingCourse = await TrackingCourseService.getLessonHistoryCourse(idAccount, idCourse);
        return new OK({
            message: "Lịch sử khoá học",
            data: trackingCourse
        }).send(res);
    }




    static async updateTrackingCourse(req, res) {
        const { idAccount, idCourse, idLesson } = req.body;
        const trackingCourse = await TrackingCourseService.addLessonToHistory(idAccount, idCourse, idLesson);
        return new OK({
            message: "Cập nhật lịch sử khoá học",
            data: trackingCourse
        }).send(res);
    }

    // Finish traking 
    static async findTrackingAccountFinish(req, res) {
        const idAccount = req.params.id;
        const trackingCourse = await TrackingCourseService.getTrackingCourseFinish(idAccount);
        return new OK({
            message: "Khoá học đã hoàn thành",
            data: trackingCourse
        }).send(res);
    }

    static async findTrackingAccountLearn(req, res) {
        const idAccount = req.params.id;
        const trackingCourse = await TrackingCourseService.getTrackingCourseLearn(idAccount);
        return new OK({
            message: "Khoá học đang học",
            data: trackingCourse
        }).send(res);
    }
}



module.exports = TrackingCourseController;