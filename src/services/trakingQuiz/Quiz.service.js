'use strict';


const { populate } = require('../../models/chapter.model');
const { CategoryQuiz } = require('../../models/trakingQuiz/categoryQuiz');
const QuizModel = require('../../models/trakingQuiz/Quiz');
const BaseService = require('../base.service');
const { BadRequestError } = require('./../../core/error.response')

class QuizService extends BaseService {
    constructor() {
        super(QuizModel);
    }
    async createQuiz(data) {
        const { categoryQuiz_id } = data;
        const category = await CategoryQuiz.findById(categoryQuiz_id);
        if (!category) {
            throw new BadRequestError('Category not found');
        }
        const quiz = await this.create(data);
        await CategoryQuiz.findByIdAndUpdate(categoryQuiz_id, { $push: { quizes: quiz._id } });
        return quiz;
    }
    // get Full Quiz 
    async getQuizFull() {
        return await this.model.find().populate({
            path: "questionQuiz",
            populate: {
                path: "answer",
                select: "titleAnswer isCorrect"
            }
        }).select('title level');
    };

    // get Quiz By Id
    async getQuizById(id) {
        return await this.model.findById(id).populate({
            path: "questionQuiz",
            populate: {
                path: "answer",
                select: "titleAnswer isCorrect"
            }
        });
    }

    // get Quiz page limit 
    async getQuizPage(page, limit) {
        // return await this.model.find().populate({
        //     path: "questionQuiz",
        //     populate: {
        //         path: "answer",
        //         select: "titleAnswer isCorrect"
        //     }
        // }).skip(page * limit).limit(limit);
        try {
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const skip = (page - 1) * limit;
            const totalQuizs = await QuizModel.countDocuments();
            const quizs = await QuizModel.find().populate(
                {
                    path: "questionQuiz",
                    populate: {
                        path: "answer",
                        select: "titleAnswer isCorrect"
                    }
                }
            )
                .skip(skip)
                .limit(limit);
            const totalPage = Math.ceil(totalQuizs / limit);
            return { quizs, totalPage, currentPage: page, totalQuizs };
        } catch (error) {

        }
    }


}


module.exports = QuizService;