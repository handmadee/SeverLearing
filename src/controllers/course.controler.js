const mongoose = require('mongoose');
const { Created, OK } = require('./../core/success.response');
const { NotFoundError, BadRequestError } = require('./../core/error.response');
const CourseService = require("../services/course/course.service");
const categoryService = new CourseService();

/**
 * Controller xử lý các thao tác liên quan đến khóa học
 */
class CourseController {
    /**
     * Tạo khóa học mới
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>}
     */
    static async createCourse(req, res) {
        return new Created({
            message: "Course created successfully",
            data: await categoryService.createCourse(req.body)
        }).send(res);
    }

    /**
     * Cập nhật thông tin khóa học
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    static async editCourse(req, res, next) {
        try {
            let updateData = { ...req.body };

            // Xử lý file ảnh đại diện nếu có
            if (req.file) {
                const file = req.file.filename;
                const avatar = `${process.env.LOCAL_HOST2}/uploads/${file}`;
                updateData.avatar = avatar;
            }

            const updatedInfo = await categoryService.update(req.params.id, updateData);
            return new OK({
                message: "Course updated successfully",
                data: updatedInfo
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CourseController();  