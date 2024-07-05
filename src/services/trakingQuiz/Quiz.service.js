'use strict';


const { CategoryQuiz } = require('../../models/trakingQuiz/categoryQuiz');
const QuizModel = require('../../models/trakingQuiz/Quiz');
const BaseService = require('../base.service');
const { BadRequestError } = require('./../../core/error.response');
const TrakingQuizServices = require('./TrakingQuiz.services');
const trakingQuiz = new TrakingQuizServices();
const TrakingQuizModel = require('../../models/trakingQuiz/TrakingQuiz');




class QuizService extends BaseService {
    constructor() {
        super(QuizModel);
    }
    // get Quiz 
    async getQuiz() {
        return await this.model.find().select('title level');
    };

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
    //
    async selectQuizByCategoryAndLevel(categoryQuiz_id, level) {
        const category = await CategoryQuiz.findById(categoryQuiz_id);
        if (!category) {
            throw new BadRequestError('Category not found');
        }
        return await this.model.find({ categoryQuiz_id, level });
    }
    // get Quiz by Category
    async getQuizByCategory(categoryQuiz_id) {
        const quizExam = await this.model.find({ categoryQuiz_id: categoryQuiz_id });
        if (quizExam) {
            return quizExam;
        }
        throw new BadRequestError('Quiz not found');
    }
    // Số lượng quiz
    async countQuiz() {
        return await this.model.countDocuments();
    }

    // Get exam by name category points user 
    async getExamAdmin(page, limit) {
        try {
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const skip = (page - 1) * limit;
            const totalQuizs = await QuizModel.countDocuments();
            const quizs = await QuizModel.find().populate(
                {
                    path: "categoryQuiz_id",
                    select: 'nameCategory'
                }
            ).select('title level categoryQuiz_id points')
                .skip(skip)
                .limit(limit);
            const totalPage = Math.ceil(totalQuizs / limit);
            // Check count quiz
            const quizsWithCount = await Promise.all(quizs.map(async (quiz) => {
                const countUser = await trakingQuiz.checkQuizbyQuiz(quiz._id);
                return { ...quiz._doc, countUser, totalPage, currentPage: page, totalQuizs };
            }));

            return quizsWithCount;
        } catch (error) {
            console.log(error)
        }
    }

    // @remove Quiz 
    async deleteQuiz(_id) {
        //del quiz hiện tại 
        // del tracking 
        // del chapter 

        try {
            await Promise.all([
                this.model.findByIdAndDelete(_id).exec(),
                TrakingQuizModel.deleteMany({
                    quizID: _id
                }).exec(),
                CategoryQuiz.deleteMany({
                    quizes: _id
                }).exec(),
            ]);
            console.log(`Course with ID ${_id} and related categories and chapters deleted successfully.`);
            return true;
        } catch (error) {
            console.error(`Error deleting course with ID ${_id}:`, error);
            throw error;
        }
    }



}


module.exports = QuizService;