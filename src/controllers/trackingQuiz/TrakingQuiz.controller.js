'use strict'

const { OK } = require("../../core/success.response");
const TrakingQuizServices = require("../../services/trakingQuiz/TrakingQuiz.services");
const TrakingQuiz = new TrakingQuizServices();

class TrakingQuizController {
    static async createCategory(req, res) {
        return new OK({
            message: "TrakingQuiz category has been successfully created.",
            data: await TrakingQuiz.create(req.body)
        }).send(res);
    }
    static async getCategory(req, res) {
        return new OK({
            message: "TrakingQuiz categories have been successfully retrieved.",
            data: await TrakingQuiz.getAll()
        }).send(res);
    }
    static async getCategoryById(req, res) {
        return new OK({
            message: "TrakingQuiz category has been successfully found.",
            data: await TrakingQuiz.getById(req.params.id)
        }).send(res);
    }
    static async updateCategory(req, res) {
        return new OK({
            message: "TrakingQuiz category has been successfully updated.",
            data: await TrakingQuiz.update(req.params.id, req.body)
        }).send(res);
    }
    static async removeCategory(req, res) {
        return new OK({
            message: "TrakingQuiz category has been successfully removed.",
            data: await TrakingQuiz.remove(req.params.id)
        }).send(res);
    }
    // Theo dõi khi người dùng bắt đầu làm bài
    static async startQuiz(req, res) {
        return new OK({
            message: "TrakingQuiz has been successfully started.",
            data: await TrakingQuiz.startQuiz(req.body)
        }).send(res);
    }
    // Theo dõi khi người dùng hoàn thành bài làm
    static async finishQuiz(req, res) {
        return new OK({
            message: "TrakingQuiz has been successfully finished.",
            data: await TrakingQuiz.finishQuiz(req.body)
        }).send(res);
    }
    // thống kê điểm số của người dùng
    static async getScore(req, res) {
        return new OK({
            message: "TrakingQuiz has been successfully get score.",
            data: await TrakingQuiz.getScore(req.params.userID)
        }).send(res);
    }
    // Xếp hạng người dùng
    static async getRanking(req, res) {
        return new OK({
            message: "TrakingQuiz has been successfully get ranking.",
            data: await TrakingQuiz.getRanking()
        }).send(res);
    }
    // Xếp hạng theo tuần
    static async getRankingByWeek(req, res) {
        return new OK({
            message: "TrakingQuiz has been successfully get ranking by week.",
            data: await TrakingQuiz.getRankingByWeek()
        }).send(res);
    }
    // Xếp hạng theo thứ hạng 
    static async getRankingByIdUser(req, res) {
        const { id } = req.params;
        return new OK({
            message: "TrakingQuiz ranking by user id.",
            data: await TrakingQuiz.getUserRank(id)
        }).send(res);
    }

}

module.exports = TrakingQuizController;