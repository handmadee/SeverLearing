
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
    static async editCourse(req, res) {
        try {
            let updateData = { ...req.body };
            if (req.file) {
                const file = req.file.filename;
                const avatar = `${process.env.LOCAL_HOST2}/uploads/${file}`;
                updateData.avatar = avatar;
            }
            const updatedInfo = await categoryService.update(req.params.id, updateData);
            return new OK({
                message: "Courses found successfully",
                data: await updatedInfo
            }).send(res);
        } catch (error) {
            next(error);
        }

    }


}

export default new CourseController();  