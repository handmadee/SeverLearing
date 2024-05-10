'use strict';

const BaseService = require("../base.service");
const NewsModel = require("../../models/news/news.model");

class NewsService extends BaseService {
    constructor() {
        super(NewsModel);
    }
    // get counts news 
    async getCountNews() {
        return await this.model.countDocuments();
    }

}

module.exports = NewsService;