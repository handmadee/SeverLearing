const { ForbiddenError, BadRequestError } = require('../../core/error.response');
const { OK, Created } = require('../../core/success.response');
const attendanceService = require('../../services/schedule/attendance.services');
const ClassService = require('../../services/schedule/class.services');

class classController {
    async createClass(req, res) {
        console.log("BODY SERVER")
        console.log(req.body)
        return new Created(
            "Created Sucess",
            await ClassService.createClass(req.body)
        ).send(res)
    }
    async addStudentsToClass(req, res) {
        return new OK({
            message: "addStudentsToClass class sucess",
            data: await ClassService.addStudentsList(req.body)
        }).send(res)
    }
    async removeStudentsToClass(req, res) {
        return new OK({
            message: "removeStudentsToClass class sucess",
            data: await ClassService.removeStudents(req.body)
        }).send(res)
    }
    async getClassByDays(req, res) {
        const { day, study } = req.query;
        return new OK({
            message: "getScheducleClass class sucess",
            data: await ClassService.getScheducleClass({ day, study })
        }).send(res)
    }


    // async getClassOfTeacher(req, res) {
    //     const idTeacher = req.params.id;
    //     const { day, study } = req.query;
    //     console.log({
    //         idTeacher: idTeacher
    //     })
    //     return new OK({
    //         message: "getClassByTeacher class success",
    //         data: await ClassService.getScheducleClassByTeacher({ day, study, idTeacher })
    //     }).send(res)
    // }

    async getClassByTeacher(req, res) {
        const idTeacher = req.params.id;
        const { day, study } = req.query;
        console.log({
            idTeacher: idTeacher
        })
        return new OK({
            message: "getClassByTeacher class success",
            data: await ClassService.getScheducleClassByTeacher({ day, study, idTeacher })
        }).send(res)
    }

    // Get all teacher 
    async getClassByTeacherAll(req, res) {
        const idTeacher = req.params.id;
        const { day, study } = req.query;
        console.log({
            idTeacher: idTeacher
        })
        return new OK({
            message: "getClassByTeacher class success",
            data: await ClassService.getScheducleClassByTeacher({ day, study, idTeacher })
        }).send(res)
    }
    // getClass by teacher 
    async getScheducleClassByTeacherAll(req, res) {
        const idTeacher = req.params.id;
        return new OK({
            message: "getClassByTeacher class success",
            data: await ClassService.getScheducleClassByTeacherAll({ idTeacher })
        }).send(res)
    }
    //
    async deleteClass(req, res) {
        const idClass = req.params.id;
        return new OK({
            message: "deleteClass class success",
            data: await ClassService.removeClass({ idClass })
        }).send(res)
    }

    // getClassAll
    async getClassAll(req, res) {
        return new OK({
            message: "get all  class success",
            data: await ClassService.getAllClass()
        }).send(res)
    }

    async getClassByID(req, res) {
        return new OK({
            message: "getClassByID  class success",
            data: await ClassService.getClassByID(req.params.id)
        }).send(res)
    }

    // edit Class
    async editClassByID(req, res) {
        return new OK({
            message: "getClassByID  class success",
            data: await ClassService.updateClass({
                idClass: req.params.id, payload: req.body
            })
        }).send(res)
    }


    async getStudetnsInClassByID(req, res) {
        return new OK({
            message: "getStudetnsInClassByID  class success",
            data: await ClassService.getStudetnsInClassByID(req.params.id)
        }).send(res)
    }




}
module.exports = new classController();