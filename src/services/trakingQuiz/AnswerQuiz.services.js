'use strict';


const AnserQuiz = require('../../models/trakingQuiz/AnserQuiz');
const quesitonQuiz = require('../../models/trakingQuiz/quesitonQuiz');
const BaseService = require('../base.service');
const { BadRequestError } = require('./../../core/error.response')
class AnserQuizServices extends BaseService {
    constructor() {
        super(AnserQuiz);
    }
    async createQuestion(data) {
        const { question_id } = data;
        const QuizTest = await quesitonQuiz.findById(question_id);
        if (!QuizTest) {
            throw new BadRequestError('Question not found');
        }
        const Answer = await this.create(data);
        await quesitonQuiz.findByIdAndUpdate(question_id, { $push: { answer: Answer._id } });
        return Answer;
    }
}


module.exports = AnserQuizServices;