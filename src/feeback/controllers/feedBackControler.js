'use strict'
const { Created, OK } = require("../../core/success.response");
const feedBackStudentService = require("../services/feedBack.servicer");
const { delFile } = require('../../untils/file.untils');
const convertExcelToFeedbackJson = require('../../untils/xlsx');






class feedBackController {
    async createdFeedBack(req, res) {
        return new Created(
            "created feedBack Success",
            await feedBackStudentService.createFeedBack(req.body)
        ).send(res);
    }
    async createBulkFileFeedback(req, res) {
        const file = req.file;
        const payload = await convertExcelToFeedbackJson(file.path);
        delFile(file.path);
        console.log({
            payload
        })
        return new Created(
            "created feedBack Success",
            await feedBackStudentService.createBulkFeedback(payload)
        ).send(res);
    }
    async createBulkFeedback(req, res) {
        return new Created(
            "created feedBack Success",
            await feedBackStudentService.createBulkFeedback(req.body)
        ).send(res);
    }

    async getAllFeedBackByStudent(req, res) {
        const id = req.params.id;
        return new OK(
            {
                message: `feedback by ${id}`,
                data: await feedBackStudentService.getFeedBackByStudents({
                    idStudent: id
                })
            }
        ).send(res);
    }


    async getFeedBackByIdForMonth(req, res) {
        const id = req.params.id;
        const month = req.query.month;

        return new OK(
            {
                message: `Get feed back for month by ${id}`,
                data: await feedBackStudentService.getFeedBackByStudentsForMonth({ idStudent: id, month: parseInt(month) })
            }
        ).send(res);
    }

    async getFeedBackByIdTeacherForMonth(req, res) {
        const id = req.params.id;
        const month = req.query.month;

        return new OK(
            {
                message: `Get feed back teacher for month by ${id}`,
                data: await feedBackStudentService.getFeedBackByTeacherForMonth({ idTeacher: id, month: parseInt(month) })
            }
        ).send(res);
    }

    async getFeedBackForMonth(req, res) {
        const month = req.query.month;
        return new OK(
            {
                message: `getFeedBackForMonth for month by `,
                data: await feedBackStudentService.getFeedBackForMonth({ month: month })
            }
        ).send(res);
    }

    async getFeedAllBackTeacher(req, res) {
        const id = req.params.id;
        return new OK(
            {
                message: `getFeedBackForMonth for month by `,
                data: await feedBackStudentService.getFeedAllBackTeacher({ idTeacher: id })
            }
        ).send(res);
    }

    // async getFeedBackForMonth(req, res) {
    //     const month = req.query.month;
    //     return new OK(
    //         {
    //             message: `Get feed back teacher for month by ${id}`,
    //             data: await feedBackStudentService.getFeedBackForMonth({ month: parseInt(month) })
    //         }
    //     ).send(res);
    // }
    // Edit 
    async modifreFeedBack(req, res) {
        const id = req.params.id;
        const body = req.body;
        return new OK(
            {
                message: `Modifre feedback success by ${id}`,
                data: await feedBackStudentService.editFeedBack({ idFeedBack: id, content: body })
            }
        ).send(res);
    }
    async removeFeedBack(req, res) {
        const id = req.params.id;
        return new OK(
            {
                message: `Remove feedback success by ${id}`,
                data: await feedBackStudentService.removeFeedBack({ idFeedBack: id })
            }
        ).send(res);
    }
    // Select all for feedback

    async getAllFeedBackByID(req, res) {
        const id = req.params.id;
        return new OK(
            {
                message: `getAllFeedBackByID  success by ${id}`,
                data: await feedBackStudentService.getAllFeedBackByID({ idStudent: id })
            }
        ).send(res);
    }


    async getFeedBackById(req, res) {
        const id = req.params.id;
        console.log(id);
        return new OK(
            {
                message: `getAllFeedBack  success `,
                data: await feedBackStudentService.getFeedById(id)
            }
        ).send(res);
    }




}


module.exports = new feedBackController();