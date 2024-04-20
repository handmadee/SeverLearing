'use strict'

const { OK } = require("../../core/success.response");
const QuestionService = require("../../services/course/question.service");
const questionService = new QuestionService();

class QuestionController {
    static async createQuestion(req, res) {
        const question = await questionService.createQuestion(req.body);
        return new OK({
            message: "Question created successfully",
            data: question
        }).send(res);
    }

    static async getQuestions(req, res) {
        const questions = await questionService.getAll();
        return new OK({
            message: "Questions retrieved successfully",
            data: questions
        }).send(res);
    }

    static async getQuestionById(req, res) {
        const question = await questionService.getById(req.params.id);
        return new OK({
            message: "Question retrieved successfully",
            data: question
        }).send(res);
    }

    static async updateQuestion(req, res) {
        const updatedQuestion = await questionService.update(req.params.id, req.body);
        return new OK({
            message: "Question updated successfully",
            data: updatedQuestion
        }).send(res);
    }

    static async removeQuestion(req, res) {
        await questionService.remove(req.params.id);
        return new OK({
            message: "Question removed successfully"
        }).send(res);
    }
}

module.exports = QuestionController;