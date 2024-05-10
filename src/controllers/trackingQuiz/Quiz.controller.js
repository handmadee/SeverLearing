'use strict'

const { OK } = require("../../core/success.response");
const QuizService = require("../../services/trakingQuiz/Quiz.service");
const Quiz = new QuizService();

class QuizController {
    static async createCategory(req, res) {
        return new OK({
            message: "Quiz category has been successfully created.",
            data: await Quiz.createQuiz(req.body)
        }).send(res);
    }
    static async getCategory(req, res) {
        return new OK({
            message: "Quiz categories have been successfully retrieved.",
            data: await Quiz.getQuizPage()
        }).send(res);
    }

    static async getCategoryById(req, res) {
        return new OK({
            message: "Quiz category has been successfully found.",
            data: await Quiz.getQuizById(req.params.id)
        }).send(res);
    }

    static async updateCategory(req, res) {
        return new OK({
            message: "Quiz category has been successfully updated.",
            data: await Quiz.update(req.params.id, req.body)
        }).send(res);
    }
    static async removeCategory(req, res) {
        return new OK({
            message: "Quiz category has been successfully removed.",
            data: await Quiz.remove(req.params.id)
        }).send(res);
    }
    static async selectQuizByCategoryAndLevel(req, res) {
        const { categoryQuiz_id, level } = req.params;
        console.log(categoryQuiz_id, level);
        return new OK({
            message: "Quiz found successfully.",
            data: await Quiz.selectQuizByCategoryAndLevel(categoryQuiz_id, level)
        }).send(res);
    }
    static async selectQuizByCategory(req, res) {
        const { categoryQuiz_id } = req.params;
        console.log(categoryQuiz_id)
        return new OK({
            message: "Quiz found successfully.",
            data: await Quiz.getQuizByCategory(categoryQuiz_id)
        }).send(res);
    }

    // get Exam 
    static async getExam(req, res) {
        return new OK({
            message: "Exam found successfully.",
            data: await Quiz.getExamAdmin()
        }).send(res);
    }

}

module.exports = QuizController;