'use strict';


const { OK } = require("../core/success.response");
const NewsService = require("../services/news/news.service");
const News = new NewsService();

class NewsController {

    static async createNews(req, res) {
        const file = req.file ? req.file.filename : null;
        const imagePost = `${process.env.LOCAL_HOST2}/uploads/${file}`;
        const postNews = await News.create({
            ...req.body,
            imagePost

        });
        return new OK({
            message: "News has been successfully created.",
            data: postNews
        }).send(res);
    }


    static async getNews(req, res) {
        return new OK({
            message: "News have been successfully retrieved.",
            data: await News.getAll()
        }).send(res);
    }
    static async getNewsById(req, res) {
        return new OK({
            message: "News has been successfully found.",
            data: await News.getById(req.params.id)
        }).send(res);
    }
    static async updateNews(req, res) {

        const dataObj = { ...req.body };
        const file = req.file ? req.file.filename : null;
        if (file) {
            dataObj.imagePost = `${process.env.LOCAL_HOST2}/uploads/${file}`;
        }
        return new OK({
            message: "News has been successfully updated.",
            data: await News.update(req.params.id, dataObj)
        }).send(res);
    }
    static async removeNews(req, res) {
        return new OK({
            message: "News has been successfully removed.",
            data: await News.remove(req.params.id)
        }).send(res);
    }
}

module.exports = NewsController;