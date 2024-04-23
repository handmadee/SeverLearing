'use strict'

const { OK } = require("../../core/success.response");
const AnserQuizServices = require("../../services/trakingQuiz/AnswerQuiz.services");
const AnswerQuiz = new AnserQuizServices();

class AnswerQuizController {
    static async createAnswer(req, res) {
        return new OK({
            message: "AnswerQuiz category has been created successfully.",
            data: await AnswerQuiz.createQuestion(req.body)
        }).send(res);
    }
    static async getAnswer(req, res) {
        return new OK({
            message: "AnswerQuiz categories have been retrieved successfully.",
            data: await AnswerQuiz.getAll()
        }).send(res);
    }
    static async getAnswerbyID(req, res) {
        return new OK({
            message: "AnswerQuiz category has been found successfully.",
            data: await AnswerQuiz.getCategoryById(req.params.id)
        }).send(res);
    }
    static async updateAnswer(req, res) {
        return new OK({
            message: "AnswerQuiz category has been updated successfully.",
            data: await AnswerQuiz.update(req.params.id, req.body)
        }).send(res);
    }
    static async removeAnswer(req, res) {
        return new OK({
            message: "AnswerQuiz category has been removed successfully.",
            data: await AnswerQuiz.remove(req.params.id)
        }).send(res);
    }
}

module.exports = AnswerQuizController;