'use strict';

const { default: mongoose } = require('mongoose');
const categoryModel = require('../../models/category.model');
const lessonModel = require('../../models/lesson.model');
const BaseService = require('../base.service');
const Course = require('./../../models/course.model');
const TrackingCourseService = require("../trackingCourse/trackingCourse.service");
const chapterModel = require('../../models/chapter.model');








class CourseService extends BaseService {
    constructor() {
        super(Course);
    }
    // Add more methods here
    async getCourseFull() {
        return await Course.find().populate({
            path: 'chapters',
            populate: [
                {
                    path: 'lessons',
                },
                {
                    path: 'exams', populate: [
                        {
                            path: 'question',
                            populate: {
                                path: 'answers'
                            }
                        }
                    ]
                },
            ]
        }).exec();
    }
    async getCourseAll() {
        return await Course.find().select('title');
    }
    async createCourse(data) {
        const { category_id } = data;
        const category = await categoryModel.findById(category_id);
        if (!category) {
            throw new Error('Category not found');
        }
        const course = await Course.create(data);
        await categoryModel.findByIdAndUpdate(category_id, { $push: { courses: course._id } });
        return course;
    }
    async findCourseByCategory(id) {
        return await Course.findById(id).populate({
            path: 'chapters',
            populate: [
                {
                    path: 'lessons',
                },
                {
                    path: 'exams', populate: [
                        {
                            path: 'question',
                            populate: {
                                path: 'answers'
                            }
                        }
                    ]
                },
            ]
        }).exec();;
    }
    async getPaginatedCourses(page, limit) {
        try {
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const skip = (page - 1) * limit;
            const totalCourses = await Course.countDocuments();
            const courses = await Course.find().select('_id title detailCourse imageCourse totalLesson category_id ')
                .skip(skip)
                .limit(limit)
                .populate('category_id', 'nameCategory -_id');
            // Calculate total pages
            const totalPages = Math.ceil(totalCourses / limit);

            return { courses, totalPages, currentPage: page, totalCourses };
        } catch (error) {
            throw error;
        }
    }
    async searchCourses(searchTerm) {
        try {
            const courses = await Course.find({
                title: { $regex: new RegExp(searchTerm, 'i') }
            });
            return courses;
        } catch (error) {
            throw error;
        }
    };
    // Find lessons by course id
    async countLessonsInCourse(courseId) {
        try {
            const totalLessons = await Course.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(courseId) } },
                { $unwind: "$chapters" },
                { $unwind: "$chapters.lessons" },
                { $group: { _id: null, total: { $sum: 1 } } }
            ]);
            return totalLessons.length > 0 ? totalLessons[0].total : 0;
        } catch (err) {
            console.error("Error counting lessons:", err);
            throw err;
        }
    }
    // Course number 
    async countCourses() {
        return await Course.countDocuments();
    }
    // Course Page 
    async getPageCourse(page, limit) {
        try {
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const skip = (page - 1) * limit;
            const totalCourses = await Course.countDocuments();
            const courses = await Course.find().select('_id title  totalLesson category_id ')
                .skip(skip)
                .limit(limit)
                .populate('category_id', 'nameCategory -_id');
            // Calculate total pages
            const totalPages = Math.ceil(totalCourses / limit);
            // Get the count of registrations for each course
            const courseRegistrations = await Promise.all(courses.map(async (course) => {
                const CourseCount = await TrackingCourseService.getTrackingCourseByIdCourse(course._id);
                return {
                    ...course._doc,
                    registrations: CourseCount
                };
            }));

            return { courses: courseRegistrations, totalPages, currentPage: page, totalCourses };
        } catch (error) {
            throw error;
        }
    }
    // update course
    async updateCourse(id, data) {
        const course = await Course.findByIdAndUpdate(id, data);
        if (!course) {
            throw new Error('Course not found');
        }
        return course;
    }
    // get course by 
    async getCourseByChapter() {
        return await Course.find().select("title").lean();
    }

    // delete course
    async deleteCourse(_id) {
        try {
            await Promise.all([
                Course.findByIdAndDelete(_id).exec(),
                categoryModel.deleteMany({ courses: _id }).exec(),
                chapterModel.deleteMany({ courseId: _id }).exec()
            ]);
            console.log(`Course with ID ${_id} and related categories and chapters deleted successfully.`);
            return true;
        } catch (error) {
            console.error(`Error deleting course with ID ${_id}:`, error);
            throw error;
        }
    }

}

module.exports = CourseService;