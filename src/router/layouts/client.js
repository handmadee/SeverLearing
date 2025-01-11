'use strict';
const express = require('express');
const { asnycHandler } = require('../../helpers/asyncHandler');
const ExamQuestionServices = require('../../examQuestion/services/exam.service');
const { request } = require('../../app');
const errorHandlerV = require('../../middleware/errorHandler');
const notFoundHandler = require('../../middleware/notfound');
const clientRouter = express.Router();


clientRouter.get('/exams', asnycHandler(async (req, res) => {
    res.render('clients/exam/listExam', { title: "Danh sách đề thi" });
}));



clientRouter.get('/exams/history', asnycHandler(async (req, res) => {
    res.render('clients/exam/historyExam', { title: "Lịch sử làm bài" });
}));


clientRouter.get('/exams/start', asnycHandler(async (req, res) => {
    let examId = req.query.examId ? req.query.examId : "";
    res.render('clients/exam/startExam', { title: "Hệ thống thi online", examId });
}));

clientRouter.get('/exams/online/:examId/:studentId', asnycHandler(async (req, res) => {
    const { examId, studentId } = req.params;
    console.log(examId, studentId);
    try {
        const hasCheckpoint = req.query.hasCheckpoint === 'true';
        const data = await ExamQuestionServices.StartExam(examId, studentId, hasCheckpoint);
        const { exam, student } = data;
        console.log(exam);
        res.render('clients/exam/exam', {
            title: "Hệ thống thi online",
            exam,
            student
        });
    } catch (error) {
        res.redirect('/exams/start?error=' + encodeURIComponent(error.message));
    }
}));

clientRouter.use(errorHandlerV);
clientRouter.use('*', notFoundHandler)




module.exports = clientRouter;
