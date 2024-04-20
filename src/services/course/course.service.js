'use strict';

const { default: mongoose } = require('mongoose');
const categoryModel = require('../../models/category.model');
const lessonModel = require('../../models/lesson.model');
const BaseService = require('../base.service');
const Course = require('./../../models/course.model');



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


}

module.exports = CourseService;