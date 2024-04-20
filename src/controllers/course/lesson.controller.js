'use strict'

const { OK } = require("../../core/success.response");
const LessonService = require("../../services/course/lesson.service");
const lessonService = new LessonService();

class LessonController {
    static async createLesson(req, res) {
        const lesson = await lessonService.createLeson(req.body);
        return new OK({
            message: "Lesson created successfully",
            data: lesson
        }).send(res);
    }

    static async getLessons(req, res) {
        const lessons = await lessonService.getAll();
        return new OK({
            message: "Lessons retrieved successfully",
            data: lessons
        }).send(res);
    }

    static async getLessonById(req, res) {
        const lesson = await lessonService.getById(req.params.id);
        return new OK({
            message: "Lesson retrieved successfully",
            data: lesson
        }).send(res);
    }

    static async updateLesson(req, res) {
        const updatedLesson = await lessonService.update(req.params.id, req.body);
        return new OK({
            message: "Lesson updated successfully",
            data: updatedLesson
        }).send(res);
    }

    static async removeLesson(req, res) {
        await lessonService.remove(req.params.id);
        return new OK({
            message: "Lesson removed successfully"
        }).send(res);
    }
}

module.exports = LessonController;