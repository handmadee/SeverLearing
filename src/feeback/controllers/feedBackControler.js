'use strict'
const { Created, OK } = require("../../core/success.response");
const feedBackStudentService = require("../services/feedBack.servicer");
const { delFile } = require('../../untils/file.untils');
const { convertExcelToFeedbackJson, exportFeedbackToExcel } = require('../../untils/xlsx');
const path = require('path');
const fs = require('fs');
const TopicService = require("../../services/topic/topic.service");





class feedBackController {
    async createdFeedBack(req, res) {
        return new Created(
            "created feedBack Success",
            await feedBackStudentService.createFeedBack(req.body)
        ).send(res);
    }
    async exportExcelFeedBack(req, res) {
        try {
            const rg = Math.floor(Math.random() * 100);
            const data = await feedBackStudentService.getFeedBackForMonth({ month: req.query.month });
            const outputDir = './output';
            const outputPath = path.join(outputDir, `feedback_${req.query.month}_${rg}.xlsx`);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            const topics = await TopicService.getTopics();
            const isExported = exportFeedbackToExcel(data, topics, outputPath);
            if (isExported) {
                if (fs.existsSync(outputPath)) {
                    res.download(outputPath, (err) => {
                        if (err) {
                            console.error('Error when sending file:', err);
                            return res.status(500).send('Error downloading the file');
                        }
                        fs.unlinkSync(outputPath);
                    });
                } else {
                    return res.status(404).send('File not found');
                }
            } else {
                return res.status(500).send('Error exporting Excel file');
            }
        } catch (err) {
            console.log(err);
            console.error('Error during file processing:', err);
            return res.status(500).send('Error processing the file');
        }
    }
    async createBulkFileFeedback(req, res) {
        const file = req.file;
        const topics = await TopicService.getTopics();
        const payload = convertExcelToFeedbackJson(file.path, topics);
        delFile(file.path);
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

    async deleteBulkFeeback(req, res) {
        const { data } = req.body;
        const remove = await feedBackStudentService.deleteBulkFeeback(data)
        return new OK(remove).send(res);
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