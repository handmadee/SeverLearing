'use strict'
const { OK, Created, NoContent } = require("../../core/success.response")
const HistoryExamService = require("../services/historyExam.serivce")

class HistoryExamControler {
    async createdHistoryExam(req, res) {
        return new Created(
            'Created History Success',
            await HistoryExamService.createHistoryExam(
                req.body
            )
        ).send(res);
    }

    async getHistoryByExamId(req, res) {
        const { id } = req.params;
        const { status } = req.query;
        console.log({ id })
        return new OK(
            await HistoryExamService.getHistoryByExamId(id, status)
        ).send(res)
    }

    async getResuftExamByStudentId(req, res) {
        const { studentId, examId } = req.params;
        return new OK(
            await HistoryExamService.getResuftExamByStudentId(studentId, examId)
        ).send(res);
    }




}

module.exports = new HistoryExamControler();