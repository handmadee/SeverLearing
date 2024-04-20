'use strict'

const { OK } = require("../../core/success.response");
const ExamService = require("../../services/course/exam.service");
const examService = new ExamService();

class ExamController {
    static async createExam(req, res) {
        const exam = await examService.createExam(req.body);
        return new OK({
            message: "Exam created successfully",
            data: exam
        }).send(res);
    }

    static async getExams(req, res) {
        const exams = await examService.getAll();
        return new OK({
            message: "Exams retrieved successfully",
            data: exams
        }).send(res);
    }

    static async getExamById(req, res) {
        const exam = await examService.getById(req.params.id);
        return new OK({
            message: "Exam retrieved successfully",
            data: exam
        }).send(res);
    }

    static async updateExam(req, res) {
        const updatedExam = await examService.update(req.params.id, req.body);
        return new OK({
            message: "Exam updated successfully",
            data: updatedExam
        }).send(res);
    }

    static async removeExam(req, res) {
        await examService.remove(req.params.id);
        return new OK({
            message: "Exam removed successfully"
        }).send(res);
    }
}

module.exports = ExamController;