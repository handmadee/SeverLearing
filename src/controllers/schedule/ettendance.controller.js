const { ForbiddenError, BadRequestError } = require('../../core/error.response');
const { OK } = require('../../core/success.response');
const attendanceService = require('../../services/schedule/attendance.services');

class AttendanceController {
    // Insert many
    async create(req, res) {
        const data = req.body;
        const result = await attendanceService.importEnttendance(data);
        return new OK({
            data: result
        }).send(res);
    }


    async getAll(req, res) {
        const { page, limit } = req.query;
        const attendances = await attendanceService.getAll(page, limit);
        return new OK({
            data: attendances
        }).send(res);
    }
    async getById(req, res) {
        const attendance = await attendanceService.getById(req.params.id);
        return new OK({
            data: attendance
        }).send(res);
    }
    async update(req, res) {
        const attendance = await attendanceService.update(req.params.id, req.body);
        return new OK({
            data: attendance
        }).send(res);
    }
    async remove(req, res) {
        await attendanceService.remove(req.params.id);
        return new OK({
            message: 'Delete success'
        }).send(res);
    }
    // Get all student by schedule
    async getStudentBySchedule(req, res) {
        const { study, date } = req.body;
        console.log({
            study, date
        })
        const dateNow = new Date(date)
        const students = await attendanceService.getStudy(study, dateNow);
        return new OK({
            data: students
        }).send(res);
    }

    // Get all student by schedule of teacher
    async getStudentByScheduleOfTeacher(req, res) {
        const { study, date } = req.query;
        const idTeacher = req.params.id;
        console.log({
            study, date,
            idTeacher
        })
        // const dateNow = new Date(date)
        const students = await attendanceService.getStudyByTeacher(study, date, idTeacher);
        return new OK({
            data: students
        }).send(res);
    }

    // Get all student by schedule and date
    async findStudentsByDate(req, res) {
        const { study, date, date1 } = req.body;
        console.log(study, date, date1)
        const students = await attendanceService.getStudyByDate(date, date1, study);
        return new OK({
            data: students
        }).send(res);
    }





    // Change attendance
    async changeAttendance(req, res) {
        const { id } = req.params;
        const data = req.body;
        const result = await attendanceService.changeAttendance(id, data);
        return new OK({
            data: result
        }).send(res);
    }
    // Get all attendance-
    async getAttendanceAloneByAccount(req, res) {
        const accountID = req.params.id;
        const { date, date1, study } = req.body;
        console.log(accountID, date, date1, study);
        const attendances = await attendanceService.getAloneByAccount(accountID, date, date1, study);
        return new OK({
            data: attendances
        }).send(res);
    }

    async getAttendanceAloneByTeacher(req, res) {
        const { date, date1, idTeacher } = req.body;
        const attendances = await attendanceService.getStudyByDateTeacher(date, date1, idTeacher);
        return new OK({
            data: attendances
        }).send(res);
    }

    // update teacher -> fieds 
    async updateStudentManyByTeacher(req, res) {
        const _id = req.params.id;
        const { idTeacher, attendance, reason } = req.body;
        console.log({
            message: 'newTest',
            attendance
        })
        const newAteendance = await attendanceService.updateStudentManyByTeacher({
            _id,
            idTeacher,
            reason,
            attendance
        });
        if (!newAteendance) throw new BadRequestError("update Ateendace notfound !");
        return newAteendance;
    }
}
module.exports = new AttendanceController();