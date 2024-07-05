'use strict';

const { BadRequestError } = require('../../core/error.response');
const CourseModel = require('../../models/course.model');
const lessonModel = require('../../models/lesson.model');
const ExamModel = require('./../../models/exam.model');
const BaseService = require('../base.service');
const chapterModel = require('./../../models/chapter.model');

class ChapterService extends BaseService {
    constructor() {
        super(chapterModel);
    }

    async getChapterFull() {
        return this.model.find().populate('courseId').select('titleChapter  courseId').lean();
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

    // get chapter by CourseID
    async getChapterByCourseId(courseId) {
        return this.model.find({ courseId: courseId })
            .populate({
                path: 'exams',
                select: 'title'
            })
            .select('titleChapter')
            .lean();

    }
    //update chapter
    async updateChapter(id, data) {
        const chapter = await this.model.findById(id);
        if (!chapter) {
            throw new BadRequestError('Chapter not found');
        }
        return this.model.findByIdAndUpdate(id, { ...chapter.toObject(), ...data }, { new: true });
    }
    //  delete by Chapter 
    async deleteChapter(_id) {
        try {
            await Promise.all([
                this.model.findByIdAndDelete(_id).exec(),
                ExamModel.deleteMany({
                    chaptter_id: _id
                }).exec(),
                lessonModel.deleteMany({
                    chaptter_id: _id
                }).exec()

            ]);
            console.log(`Course with ID ${_id} and related categories and chapters deleted successfully.`);
            return true;
        } catch (error) {
            console.error(`Error deleting course with ID ${_id}:`, error);
            throw error;
        }
    }

}


module.exports = ChapterService;