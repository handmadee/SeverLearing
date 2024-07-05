'use strict';

const { BadRequestError } = require('../../core/error.response');
const ChapterModel = require('../../models/chapter.model');
const BaseService = require('../base.service');
const ExamModel = require('./../../models/exam.model');
const Question = require('./../../models/question');
class ExamService extends BaseService {
    constructor() {
        super(ExamModel);
    }
    async getExamFull() {
        return this.model.find().populate('chaptter_id').select('titleExam chaptter_id');
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

    async deleteExam(_id) {
        try {
            await Promise.all([
                this.model.findByIdAndDelete(_id).exec(),
                Question.deleteMany({
                    exam_id: _id
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

module.exports = ExamService;