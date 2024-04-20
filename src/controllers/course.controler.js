
const mongoose = require('mongoose');
const { Created, OK } = require('./../core/success.response');
const { NotFoundError, BadRequestError } = require('./../core/error.response')
import CourseService from "../services/course/course.service";
const categoryService = new CourseService();
// Xử lý controler cho toàn bộ khoá học 

class CourseController {
    static async createCourse(req, res) {
        return new Created({
            message: "Course created successfully",
            data: await categoryService.createCourse(req.body)
        }).send(res);
    }
}

export default new CourseController();  