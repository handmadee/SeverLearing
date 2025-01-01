'use strict'

const { Created, OK, NoContent } = require("../../core/success.response");
const ExamQuestionServices = require("../services/exam.service");

class ExamControllers {
    /** Các task liên quan tới bài kiểm tra
     * 
     * I, lấy ra danh sách tất cả bài kiểm tra 
     * II, CRUD 
     * II, start Exam 
     * IV, 
     */
    async getAllExam(req, res) {
        const { status, q, page = 1, limit = 20, select } = req.query;
        console.log(status, q, page, limit, select)
        return new OK(
            await ExamQuestionServices.getAllExams(status, select, page, limit, q)
        ).send(res);
    }
    async createdExam(req, res) {
        return new Created(
            'CREATED EXAM SUCCESS !',
            await ExamQuestionServices.createExam(req.body)
        ).send(res);
    }
    async delExam(req, res) {
        const { id } = req.params;
        return new NoContent(
            '[2004] REMOVE EXAM SUCCESS !',
            await ExamQuestionServices.delExamById(id)
        ).send(res);
    }
    async updateExam(req, res) {
        const { id } = req.params;
        console.log(id)
        const payload = req.body;
        return new OK(
            await ExamQuestionServices.updateById(id, payload)
        ).send(res);
    }
    async changeExam(req, res) {
        console.log("NO NO NO CODE")
        const { id } = req.params;
        return new OK(
            await ExamQuestionServices.changeStatusExam(id)
        ).send(res);
    }
    //! task I: Kiểm tra user và id account
    async checkStartExamById(req, res) {
        const { examId, studentId } = req.body;
        return new OK(
            await ExamQuestionServices.checkStartExam(examId, studentId)
        ).send(res);
    }

    async startExamById(req, res) {
        const { examId, studentId } = req.body;
        return new OK(
            await ExamQuestionServices.StartExam(examId, studentId)
        ).send(res);
    }
    async getExamById(req, res) {
        const { id } = req.params;
        return new OK(
            await ExamQuestionServices.getExamById(id)
        ).send(res)
    }

    // !chi tiết bài kiểm tra 
    // GỒM SỐ LƯỢNG HỌC SINH LÀM BÀI 
    // 


}
module.exports = new ExamControllers();