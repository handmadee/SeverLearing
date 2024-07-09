'use strict'

const { OK } = require("../../core/success.response");
const QuestionQuizService = require("../../services/trakingQuiz/QuestionQuiz.service");
const QuestionQuiz = new QuestionQuizService();

class QuestionQuizController {

    static async createQuestion(req, res) {
        const file = req.file ? req.file.path : null;
        const imageQuestion = file;
        const question = await QuestionQuiz.createQuestion({
            ...req.body,
            imageQuestion
        });
        return new OK({
            message: "Question created successfully",
            data: question
        }).send(res);
    }

    static async getQuestion(req, res) {
        return new OK({
            message: "Quiz categories have been retrieved successfully.",
            data: await QuestionQuiz.getAll()
        }).send(res);
    }
    static async getQuestionById(req, res) {
        return new OK({
            message: "Quiz category has been found successfully.",
            data: await QuestionQuiz.getCategoryById(req.params.id)
        }).send(res);
    }
    static async updateQuestion(req, res) {
        const updateData = { ...req.body };
        if (req.file) {
            const file = req.file.path;
            const imageQuestion = file;
            updateData.imageQuestion = imageQuestion;
        }
        return new OK({
            message: "Quiz category has been updated successfully.",
            data: await QuestionQuiz.update(req.params.id, updateData)
        }).send(res);
    }

    static async removeQuestion(req, res) {
        return new OK({
            message: "Quiz category has been removed successfully.",
            data: await QuestionQuiz.remove(req.params.id)
        }).send(res);
    }

}

module.exports = QuestionQuizController;