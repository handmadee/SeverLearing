'use strict';

const { BadRequestError } = require('../../core/error.response');
const CourseModel = require('../../models/course.model');
const BaseService = require('../base.service');
const ChapterModel = require('./../../models/chapter.model');

class ChapterService extends BaseService {
    constructor() {
        super(ChapterModel);
    }

    async createChapter(data) {
        const { courseId } = data;
        const course = await CourseModel.findById(courseId);
        if (!course) {
            throw new BadRequestError('Course not found');
        }
        const chapter = await this.create(data);
        await CourseModel.findByIdAndUpdate(courseId, { $push: { chapters: chapter._id } });
        return chapter;
    }
}

module.exports = ChapterService;