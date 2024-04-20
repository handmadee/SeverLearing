'use strict';

const { BadRequestError } = require('../../core/error.response');
const ChapterModel = require('../../models/chapter.model');
const BaseService = require('../base.service');
const ExamModel = require('./../../models/exam.model');
class ExamService extends BaseService {
    constructor() {
        super(ExamModel);
    }

    async createExam(data) {
        const { chaptter_id } = data;
        const chapter = await ChapterModel.findById(chaptter_id);
        if (!chapter) {
            throw new BadRequestError('Chapter not found');
        }
        const exam = await this.create(data);
        await ChapterModel.findByIdAndUpdate(chaptter_id, { $push: { exams: exam._id } });
    }
}

module.exports = ExamService;