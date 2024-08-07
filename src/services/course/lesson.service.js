'use strict';

const ChapterModel = require('../../models/chapter.model');
const courseModel = require('../../models/course.model');
const BaseService = require('../base.service');
const Lesson = require('./../../models/lesson.model');



class LessonService extends BaseService {
  constructor() {
    super(Lesson);
  }
  async createLeson(data) {
    const { chaptter_id } = data;
    const chapter = await ChapterModel.findById(chaptter_id);
    if (!chapter) {
      throw new BadRequestError('Lesson not found');
    }
    const lesson = await this.create(data);
    await ChapterModel.findByIdAndUpdate(chaptter_id, { $push: { lessons: lesson._id } });
    await courseModel.findByIdAndUpdate(chapter.courseId, { $inc: { totalLesson: 1 } });
    return lesson;
  }

  async removeLesson(_id) {
    try {
      await Promise.all([
        this.model.findByIdAndDelete(_id).exec(),
        ChapterModel.deleteMany({
          lessons: _id
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

module.exports = LessonService;