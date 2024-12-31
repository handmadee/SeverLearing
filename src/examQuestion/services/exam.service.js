'use strict'
const { NotFoundError, ForbiddenError } = require("../../core/error.response");
const examRepository = require("../repositories/exam.repository");
const studentsService = require("./../../services/schedule/schedule.service")

class ExamQuestionServices {
    static async createExam(payload) {
        console.log({
            payload
        })
        return await examRepository.createdExam(payload);
    }

    static async getAllExams(status, select, page, limit, search) {
        return await examRepository.getAllExam(status, select, page, limit, search);
    }
    static async foundExam(id) {
        const foundExam = await examRepository.examExistsById(id);
        if (!foundExam) throw new NotFoundError('Exam not found !');
    }
    static async getExamById(id, select) {
        await this.foundExam(id);
        return await examRepository.getExamById(id, select);
    }

    static async getExam(query, select) {
        console.log({
            query, select
        })
        return await examRepository.model.findOne(query).select(select);
    }


    static async delExamById(id) {
        await this.foundExam(id);
        return await examRepository.removeExamById(id);
    }
    static async updateById(id, payload) {
        await this.foundExam(id);
        return await examRepository.updateExamById(id, payload);
    }
    static async changeStatusExam(id) {
        const foundStatus = await this.getExamById(id);
        foundStatus.examIsActive = !foundStatus.examIsActive;
        return foundStatus.save();
    }
    static async checkStartExam(examId, studentId) {
        const foundStudent = await studentsService.getStudentById(studentId, 'fullname _id');
        if (!foundStudent) throw new NotFoundError('Student not found !!');
        //!title thiếu '_id answers title expTime'
        const foundExam = await this.getExam({
            _id: examId,
            examIsActive: true
        });
        if (!foundExam) throw new NotFoundError('Exam not found !!');
        const count = foundExam.examStudentUsed.filter((id) => id == studentId).length;
        if (count >= foundExam.limitUser) {
            throw new ForbiddenError('You have passed too many test attempts');
        }
        return {
            student: foundStudent,
            exam: foundExam
        };
    }
    static async StartExam(examId, studentId, checkPoint = false) {
        const foundStudent = await studentsService.getStudentById(studentId, 'fullname _id');
        if (!foundStudent) throw new NotFoundError('Student not found !!');
        const foundExam = await this.getExam({
            _id: examId,
            examIsActive: true
        });
        if (!foundExam) throw new NotFoundError('Exam not found !!');
        const count = foundExam.examStudentUsed.filter((id) => id == studentId).length;
        if (count >= foundExam.limitUser) {
            throw new ForbiddenError('You have passed too many test attempts');
        }
        if (!checkPoint) {
            foundExam.examStudentUsed = [...foundExam.examStudentUsed, studentId];
            foundExam.countUsed += 1;
        }
        await foundExam.save();
        // TODO: Xử lý thêm logic cho applyStudentIds nếu cần
        return {
            student: foundStudent,
            exam: foundExam
        };
    }
    // Tìm bài kiểm tra
    static async searchExam(query) {
        return await examRepository.searchExamByTitle(query, "-examIsActive");
    }

    // static async addAccountUsed(id, userId) {

    // }
    // static async decrementCount(id) {
    //     await this.foundExam(id);
    //     return await ex

    // }




}


module.exports = ExamQuestionServices;