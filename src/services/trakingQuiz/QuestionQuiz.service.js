'use strict';




const quesitonQuiz = require('../../models/trakingQuiz/quesitonQuiz');
const BaseService = require('../base.service');
const QuizModel = require('./../../models/trakingQuiz/Quiz');


class QuestionQuizService extends BaseService {
    constructor() {
        super(quesitonQuiz);
    }
    async createQuestion(data) {
        const { quiz } = data;
        const QuizTest = await QuizModel.findById(quiz);
        if (!QuizTest) {
            throw new BadRequestError('Quiz  not found');
        }
        const Question = await this.create(data);
        await QuizModel.findByIdAndUpdate(quiz, { $push: { questionQuiz: Question._id } });
        return Question;
    }

    // Select Quiz By Category and level

}


module.exports = QuestionQuizService;