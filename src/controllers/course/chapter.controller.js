'use strict'

const { OK } = require("../../core/success.response");
const ChapterService = require("./../../services/course/chapter.service");
const chapterService = new ChapterService();

class ChapterController {
    static async createChapter(req, res) {
        const chapter = await chapterService.createChapter(req.body);
        return new OK({
            message: "Chapter created successfully",
            data: chapter
        }).send(res);
    }

    static async getFullChapter(req, res) {
        return new OK({
            message: "Chapter retrieved successfully",
            data: await chapterService.getAll()
        }).send(res);

    }

    static async getChapters(req, res) {
        const chapters = await chapterService.getAll();
        return new OK({
            message: "Chapters retrieved successfully",
            data: chapters
        }).send(res);
    }

    static async getChapterById(req, res) {
        const chapter = await chapterService.getById(req.params.id);
        return new OK({
            message: "Chapter retrieved successfully",
            data: chapter
        }).send(res);
    }

    static async updateChapter(req, res) {
        const updatedChapter = await chapterService.updateChapter(req.params.id, req.body);
        return new OK({
            message: "Chapter updated successfully",
            data: updatedChapter
        }).send(res);
    }

    static async removeChapter(req, res) {
        await chapterService.deleteChapter(req.params.id);
        return new OK({
            message: "Chapter removed successfully"
        }).send(res);
    }

    // getChapter by Course ID
    static async getChapterByCourseId(req, res) {
        const chapters = await chapterService.getChapterByCourseId(req.params.id);
        return new OK({
            message: "Chapters retrieved successfully",
            data: chapters
        }).send(res);
    }


    // Edit vieo course 


}

module.exports = ChapterController;