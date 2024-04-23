'use strict';

const { populate } = require('../../models/chapter.model');
const { CategoryQuiz } = require('../../models/trakingQuiz/categoryQuiz');
const BaseService = require('../base.service');
const { BadRequestError } = require('./../../core/error.response')

class categoryQuizService extends BaseService {
    constructor() {
        super(CategoryQuiz);
    }
    async getCategoryFull() {
        return await this.model.find().select('nameCategory');
    }
    async getCategoryQuizById(id) {
        return await this.model.findById(id).populate({
            path: "quizes",
            select: "nameCategory title  time  level "
        });
    }
}


module.exports = categoryQuizService;