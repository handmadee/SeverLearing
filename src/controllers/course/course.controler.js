'use strict'

const { OK } = require("../../core/success.response");
const CourseService = require("../../services/course/course.service");
const courseService = new CourseService();

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

    static async getCourseById(req, res) {
        const course = await courseService.findCourseByCategory(req.params.id);
        return new OK({
            message: "Course retrieved successfully",
            data: course
        }).send(res);
    }

    static async updateCourse(req, res) {
        const updatedCourse = await courseService.update(req.params.id, req.body);
        return new OK({
            message: "Course updated successfully",
            data: updatedCourse
        }).send(res);
    }

    static async removeCourse(req, res) {
        await courseService.remove(req.params.id);
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


}

module.exports = CourseController;

