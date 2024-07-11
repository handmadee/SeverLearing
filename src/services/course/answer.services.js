'use strict';

const { BadRequestError } = require('../../core/error.response');
const AnswerModel = require('../../models/answer.model');
const questionModel = require('../../models/question');
const BaseService = require('../base.service');


class AnswerService extends BaseService {
    constructor() {
        super(AnswerModel);
    }
    async createAnswer(data) {
        const { question_id } = data;
        const question = await questionModel.findById(question_id);
        if (!question) {
            throw new BadRequestError('Exam not found');
        }
        const answer = await this.create(data);
        await questionModel.findByIdAndUpdate(question_id, { $push: { answers: answer._id } }); // Add new answer to the exam
        return answer;
    }
}

module.exports = AnswerService;