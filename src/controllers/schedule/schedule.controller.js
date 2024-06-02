const { ForbiddenError } = require('../../core/error.response');
const { OK } = require('../../core/success.response');
const StudentShecheduleService = require('../../services/schedule/schedule.service');
const attendanceService = require('../../services/schedule/attendance.services');
const xlsx = require("xlsx");
const fs = require("fs");
const _ = require("lodash");


class StudentShecheduleController {

    async importShechedule(req, res) {
        const file = req.file;
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        // delete file after read
        fs.unlinkSync(file.path);
        const convertDays = (daysString) => {
            return daysString.split(',').map(day => parseInt(day.trim()));
        }
        const convertedData = data.map(item => {
            return {
                ...item,
                days: convertDays(item.days)
            };

        });
        return new OK({
            message: 'Import success',
            sheetName,
            data: await StudentShecheduleService.importStudents(convertedData)
        }).send(res);
    }
    async getAllShechedule(req, res) {
        const { page, limit } = req.query;
        const shechedules = await StudentShecheduleService.getAllShechedule(page, limit);
        return new OK({
            data: shechedules
        }).send(res);
    }
    async deleteShechedule(req, res) {
        const id = req.params.id;
        await StudentShecheduleService.remove(id);
        await attendanceService.delAccountID(id);
        return new OK({
            message: 'Delete success'
        }).send(res);
    }
    async getShecheduleById(req, res) {
        const shechedule = await StudentShecheduleService.getById(req.params.id);
        return new OK({
            data: shechedule
        }).send(res);
    }
    async updateShechedule(req, res) {
        console.log(req.body)
        const shechedule = await StudentShecheduleService.update(req.params.id, req.body);
        return new OK({
            data: shechedule
        }).send(res);
    }
    // get days and Study
    async getStudy(req, res) {
        const { study, days } = req.query;
        console.log(study, days)
        const shechedule = await StudentShecheduleService.getStudy(study, days);
        return new OK({
            data: shechedule
        }).send(res);
    }
    // import students
    async importPersonalShechedule(req, res) {
        const data = req.body;
        const result = await StudentShecheduleService.create(data);
        return new OK({
            data: result
        }).send(res);
    }

}
module.exports = new StudentShecheduleController();