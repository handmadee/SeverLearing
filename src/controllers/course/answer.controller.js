'use strict'

const { OK } = require("../../core/success.response");
const AnswerService = require("../../services/course/answer.services");

const answerService = new AnswerService();

class AnswerController {
    static async createAnswer(req, res) {
        const answer = await answerService.createAnswer(req.body);
        return new OK({
            message: "Answer created successfully",
            data: answer
        }).send(res);
    }

    static async getAnswers(req, res) {
        const answers = await answerService.getAll();
        return new OK({
            message: "Answers retrieved successfully",
            data: answers
        }).send(res);
    }

    static async getAnswerById(req, res) {
        const answer = await answerService.getById(req.params.id);
        return new OK({
            message: "Answer retrieved successfully",
            data: answer
        }).send(res);
    }

    static async updateAnswer(req, res) {
        const updatedAnswer = await answerService.update(req.params.id, req.body);
        return new OK({
            message: "Answer updated successfully",
            data: updatedAnswer
        }).send(res);
    }

    static async removeAnswer(req, res) {
        await answerService.remove(req.params.id);
        return new OK({
            message: "Answer removed successfully"
        }).send(res);
    }
}

module.exports = AnswerController;