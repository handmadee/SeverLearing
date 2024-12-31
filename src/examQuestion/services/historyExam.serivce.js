'use strict'

const StudentShecheduleService = require('./../../services/schedule/schedule.service');
const historyExamRepository = require("../repositories/historyExam.repository");
const ExamQuestionServices = require("./exam.service");
const scheduleService = require("./../../services/schedule/schedule.service");

class HistoryExamService {
    static async createHistoryExam(payload) {
        const { examRef, userRef } = payload;
        await StudentShecheduleService.checkStudentExistenceById(userRef);
        const { answers: correctAnswersList } = await ExamQuestionServices.getExamById(examRef);
        const totalQuestions = correctAnswersList.length;
        const { studentAnswers } = payload;
        if (!Array.isArray(studentAnswers) || studentAnswers.length !== totalQuestions) {
            throw new Error("Invalid or mismatched student answers.");
        }
        let correctAnswers = 0;
        for (let i = 0; i < totalQuestions; i++) {
            if (studentAnswers[i] === correctAnswersList[i]) correctAnswers++;
        }
        const incorrectAnswers = totalQuestions - correctAnswers;
        const result = correctAnswers >= totalQuestions * 0.8;
        const historyExam = {
            correctAnswers,
            incorrectAnswers,
            result,
            examRef,
            userRef,
        };

        return historyExamRepository.create(historyExam);
    }


    static async getHistoryByExamId(id) {
        await ExamQuestionServices.foundExam(id);
        return await historyExamRepository.getAllHistory({ examRef: id });
    }

    static async getResuftExamByStudentId(studentId, examId) {
        await scheduleService.checkStudentExistenceById(studentId);
        let query = {
            userRef: studentId
        }
        if (examId) {
            await ExamQuestionServices.foundExam(examId);
            query.examRef = examId
        }
        return await historyExamRepository.getAllHistory(query);
    }







}

module.exports = HistoryExamService;