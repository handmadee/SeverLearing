'use strict'

const { OK } = require("../../core/success.response");
const CourseService = require("../../services/course/course.service");
const courseService = new CourseService();
const sharp = require('sharp');

class CourseController {

    static async createCourse(req, res) {
        const file = req.file ? req.file.filename : null;
        const imageCourse = `${process.env.LOCAL_HOST2}/uploads/${file}`;
        const course = await courseService.createCourse({
            ...req.body,
            imageCourse

        });
        return new OK({
            message: "Course created successfully",
            data: course
        }).send(res);
    }

    static async getCourses(req, res) {
        const courses = await courseService.getPaginatedCourses();
        return new OK({
            message: "Courses retrieved successfully",
            data: courses
        }).send(res);
    }

    // get full course 
    static async getCourseAll(req, res) {
        const courses = await courseService.getCourseAll();
        return new OK({
            message: "Courses retrieved successfully",
            data: courses
        }).send(res);

    };


    static async getCourseById(req, res) {
        const course = await courseService.findCourseByCategory(req.params.id);
        return new OK({
            message: "Course retrieved successfully",
            data: course
        }).send(res);
    }

    static async updateCourse(req, res) {
        try {
            let updateData = { ...req.body };
            console.log(req.body)
            if (req.file) {
                const file = req.file.filename;
                const avatar = `${process.env.LOCAL_HOST2}/uploads/${file}`;
                updateData.imageCourse = avatar;
            }
            const updatedInfo = await courseService.updateCourse(req.params.id, updateData);
            return new OK({
                message: "Courses found successfully",
                data: updatedInfo
            }).send(res);
        } catch (error) {
            console.log(error)
            res.send(error);
        }
    }

    static async removeCourse(req, res) {
        await courseService.deleteCourse(req.params.id);
        return new OK({
            message: "Course removed successfully"
        }).send(res);
    }

    static async searchCourse(req, res) {
        const searchTerm = req.query.q;
        return new OK({
            message: "Courses retrieved successfully",
            data: await courseService.searchCourses(searchTerm)
        }).send(res);
    }

    static async getCountLesson(req, res) {
        const Course = await courseService.countLessonsInCourse(req.params.id);
        return new OK({
            message: "Course retrieved successfully",
            data: Course
        }).send(res);
    }

    static async getCoursePage(req, res) {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const courses = await courseService.getPageCourse(page, limit);
        return new OK({
            message: "Courses retrieved successfully",
            data: courses
        }).send(res);
    }


    getCourseByAccount(req, res) {
        const idAccount = req.params.id;
        return new OK({
            message: "Courses retrieved successfully",
            data: courseService.getById(idAccount)
        }).send(res);
    }

}

module.exports = CourseController;

