// Question service
'use strict';

const examModel = require('../../models/exam.model');
const BaseService = require('../base.service');
const Question = require('./../../models/question');

class QuestionService extends BaseService {
    constructor() {
        super(Question);
    }
    async createQuestion(data) {
        const { exam_id } = data;
        const exam = await examModel.findById(exam_id);
        if (!exam) {
            throw new BadRequestError('Chapter not found');
        }
        const question = await this.create(data);
        await examModel.findByIdAndUpdate(exam_id, { $push: { question: question._id } });
    }
}

module.exports = QuestionService;
