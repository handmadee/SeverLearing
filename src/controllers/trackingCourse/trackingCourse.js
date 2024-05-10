

const { Created, OK } = require("../../core/success.response");
const TrackingCourseService = require("./../../services/trackingCourse/trackingCourse.service");



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

    static async getFullTrackingCourse(req, res) {
        const trackingCourse = await TrackingCourseService.getTrackingCourseFull();
        return new OK({
            message: "Lịch sử khoá học",
            data: trackingCourse
        }).send(res);
    }

    // Tracking course by id
    static async getTrackingCourseById(req, res) {
        const trackingCourse = await TrackingCourseService.getTrackingCourseByIdCourse(req.params.id);
        return new OK({
            message: "Số học sinh đã đăng kí khoá",
            data: trackingCourse
        }).send(res);
    }
    // Tracking course by id
    static async getTrackingCourseByIdUser(req, res) {
        const trakingABC = await TrackingCourseService.getTrackingCourseByIdUser(req.params.id);
        return new OK({
            message: "Số học sinh đã đăng kí khoá",
            data: trakingABC
        }).send(res);
    }

    // traking topCourse 
    static async getTopCourse(req, res) {
        const trackingCourse = await TrackingCourseService.getTrackingCourseTopCourse();
        return new OK({
            message: "Top khoá học",
            data: trackingCourse
        }).send(res);
    }
    // Tracking low Course 
    static async getLowCourse(req, res) {
        const trackingCourse = await TrackingCourseService.getTrackingCourseLowCourse();
        return new OK({
            message: "Top khoá học",
            data: trackingCourse
        }).send(res);
    }
}



module.exports = TrackingCourseController;