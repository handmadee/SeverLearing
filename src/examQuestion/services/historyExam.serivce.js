'use strict';

const StudentScheduleService = require('./../../services/schedule/schedule.service');
const historyExamRepository = require("../repositories/historyExam.repository");
const ExamQuestionServices = require("./exam.service");

class HistoryExamService {
    static async createHistoryExam(payload) {
        const { examRef, userRef, studentAnswers } = payload;
        await StudentScheduleService.checkStudentExistenceById(userRef);
        const { answers: correctAnswersList } = await ExamQuestionServices.getExamById(examRef);
        const totalQuestions = correctAnswersList.length;
        if (!Array.isArray(studentAnswers) || studentAnswers.length !== totalQuestions) {
            throw new Error("Invalid or mismatched student answers.");
        }
        let correctAnswers = [];
        let incorrectAnswers = [];
        for (let i = 0; i < totalQuestions; i++) {
            if (studentAnswers[i] === correctAnswersList[i]) {
                correctAnswers.push({ index: i, answer: studentAnswers[i] });
            } else {
                incorrectAnswers.push({ index: i, answer: studentAnswers[i], correctAnswer: correctAnswersList[i] });
            }
        }
        const result = correctAnswers.length >= totalQuestions * 0.8;
        const historyExam = {
            examRef,
            userRef,
            correctAnswers,
            incorrectAnswers,
            result,
        };
        return historyExamRepository.create(historyExam);
    }

    static async getHistoryByExamId(id, status, q) {
        let query = {
            examRef: id
        };
        if (status) query.examIsActive = status;
        await ExamQuestionServices.foundExam(id);
        return await historyExamRepository.getAllHistory(query);
    }

    static async getResultExamByStudentId(studentId, examId) {
        await StudentScheduleService.checkStudentExistenceById(studentId);
        let query = {
            userRef: studentId
        };
        if (examId) {
            await ExamQuestionServices.foundExam(examId);
            query.examRef = examId;
        }
        return await historyExamRepository.getAllHistory(query);
    }

    static async removeBulkExamById(examIds) {
        if (!Array.isArray(examIds) || examIds.length === 0) {
            throw new Error("Invalid or empty exam IDs array.");
        }
        return await historyExamRepository.removeBulkByIds(examIds);
    }
}

module.exports = HistoryExamService;