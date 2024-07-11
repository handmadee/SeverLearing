'use strict';

const { ForbiddenError } = require('../../core/error.response');
const Quiz = require('../../models/trakingQuiz/Quiz');
const TrakingQuiz = require('../../models/trakingQuiz/TrakingQuiz');
const BaseService = require('../base.service');

class TrakingQuizServices extends BaseService {
    constructor() {
        super(TrakingQuiz);
    }

    async startQuiz(data) {
        const { userID, quizID } = data;
        const quiz = await Quiz.findById(quizID);
        if (!quiz) {
            throw new ForbiddenError('Quiz not found');
        }
        // Check if user has already started the quiz
        const isContain = await TrakingQuiz.findOne({ userID, quizID });
        if (isContain) {
            throw new ForbiddenError('User has already started the quiz');
        }
        const trakingQuiz = await TrakingQuiz.create({ userID, quizID });
        return trakingQuiz;
    }

    async finishQuiz(data) {
        const { userID, quizID, Score } = data;
        const trakingQuiz = await TrakingQuiz.findOneAndUpdate(
            { userID, quizID },
            { Score },
            { new: true }
        );
        if (!trakingQuiz) {
            throw new ForbiddenError('TrakingQuiz not found');
        }
        return trakingQuiz;
    }

    async getScore(userID) {
        const trakingQuiz = await TrakingQuiz.find({ userID });
        if (!trakingQuiz) {
            throw new ForbiddenError('No TrakingQuiz found');
        }
        return trakingQuiz.reduce((total, item) => total + item.Score, 0);
    }
    async getRankingTop10() {
        const trakingQuiz = await TrakingQuiz.find().populate({
            path: 'userID',
            populate: {
                path: 'info',
                select: 'fullname avatar'
            }
        });
        if (!trakingQuiz) {
            throw new ForbiddenError('No TrakingQuiz found');
        }
        const rankingMap = new Map();
        trakingQuiz.forEach(quiz => {
            const { userID, Score } = quiz;
            if (!userID) {
                return;
            }
            const { _id, info } = quiz?.userID;
            if (!info) {
                return;
            }
            const { fullname, avatar } = info;
            if (!rankingMap.has(userID)) {
                rankingMap.set(userID, { userID: _id, name: fullname, avatar, Score });
            } else {
                rankingMap.get(userID).Score += Score;
            }
        });

        const ranking = [...rankingMap.values()].sort((a, b) => b.Score - a.Score);
        return ranking.slice(0, 10);
    }
    async getUserRank(userID) {
        try {
            const ranking = await this.getRanking();
            const userRank = ranking?.rank.findIndex(user => user.userID == userID);
            if (userRank === -1) {
                return 999;
            }
            return userRank + 1;
        } catch (error) {
            console.error('Error getting user rank:', error);
            throw error;
        }
    }
    async getRankingByWeek() {
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 6) % 7);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const trakingQuiz = await TrakingQuiz.find({
            createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        }).populate({
            path: 'userID',
            populate: {
                path: 'info',
                select: 'fullname avatar'
            }
        });

        if (!trakingQuiz) {
            throw new ForbiddenError('No TrakingQuiz found for this week');
        }

        const rankingMap = new Map();
        trakingQuiz.forEach(quiz => {
            const { userID, Score } = quiz;
            if (!userID) {
                return [];
            }
            const { _id, info } = quiz.userID;
            if (!info) {
                return;
            }
            const { fullname, avatar } = info;

            if (!rankingMap.has(userID)) {
                rankingMap.set(userID, { userID: _id, name: fullname, avatar, Score });
            } else {
                rankingMap.get(userID).Score += Score;
            }
        });

        const ranking = [...rankingMap.values()].sort((a, b) => b.Score - a.Score);
        return ranking.slice(0, 10);
    }
    async checkQuizInMonth(userID) {
        try {
            const currentDate = new Date();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            const trakingQuiz = await TrakingQuiz.find({
                userID,
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            });
            return trakingQuiz.length;
        } catch (error) {
            console.error('Error checking quiz in month:', error);
            throw error;
        }
    }
    // check xem số bài quiz mà user đã làm 
    async checkQuizbyUser(userID) {
        try {
            const trakingQuiz = await TrakingQuiz.find({ userID });
            if (!trakingQuiz) {
                throw new ForbiddenError('No TrakingQuiz found');
            }
            return trakingQuiz.length;
        } catch (error) {
            console.error('Error checking quiz in month:', error);
            throw error;
        }
    }
    // check xem 1 bài có bao nhiêu user làm
    async checkQuizbyQuiz(quizID) {
        try {
            const trakingQuiz = await TrakingQuiz.find({ quizID });
            if (!trakingQuiz) {
                throw new ForbiddenError('No TrakingQuiz found');
            }
            return trakingQuiz.length;
        } catch (error) {
            console.error('Error checking quiz in month:', error);
            throw error;
        }
    }
    // Ranking in view 
    async getRanking(page = 1, limit = 10) {
        const trakingQuiz = await TrakingQuiz.find().populate({
            path: 'userID',
            populate: {
                path: 'info',
                select: 'fullname avatar'
            }
        });
        if (!trakingQuiz) {
            throw new ForbiddenError('No TrakingQuiz found');
        }
        const rankingMap = new Map();
        trakingQuiz.forEach(quiz => {
            const { userID, Score } = quiz;
            if (!userID) {
                return;
            }
            const { _id, info } = quiz?.userID;
            if (!info) {
                return;
            }
            const { fullname, avatar } = info;
            if (!rankingMap.has(userID)) {
                rankingMap.set(userID, { userID: _id, name: fullname, avatar, Score });
            } else {
                rankingMap.get(userID).Score += Score;
            }
        });

        const ranking = [...rankingMap.values()].sort((a, b) => b.Score - a.Score);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        return {
            rank: ranking.slice(startIndex, endIndex),
            totalItems: ranking.length
        };
    }
    // select ranking week 
    async getRankingByWeekPage(page = 1, limit = 10) {
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 6) % 7);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const trakingQuiz = await TrakingQuiz.find({
            createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        }).populate({
            path: 'userID',
            populate: {
                path: 'info',
                select: 'fullname avatar'
            }
        });

        if (!trakingQuiz) {
            throw new ForbiddenError('No TrakingQuiz found for this week');
        }

        const rankingMap = new Map();
        trakingQuiz.forEach(quiz => {
            const { userID, Score } = quiz;
            const { _id, info } = quiz.userID;
            if (!userID) {
                return [];
            }
            if (!info) {
                return;
            }

            const { fullname, avatar } = info;

            if (!rankingMap.has(userID)) {
                rankingMap.set(userID, { userID: _id, name: fullname, avatar, Score });
            } else {
                rankingMap.get(userID).Score += Score;
            }
        });

        const ranking = [...rankingMap.values()].sort((a, b) => b.Score - a.Score);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        return {
            rank: ranking.slice(startIndex, endIndex),
            totalItems: ranking.length
        };
    }
    // select ranking month 
    async getRankingByMonthPage(page = 1, limit = 10) {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const trakingQuiz = await TrakingQuiz.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }).populate({
            path: 'userID',
            populate: {
                path: 'info',
                select: 'fullname avatar'
            }
        });

        if (!trakingQuiz) {
            throw new ForbiddenError('No TrakingQuiz found for this month');
        }

        const rankingMap = new Map();
        trakingQuiz.forEach(quiz => {
            const { userID, Score } = quiz;
            const { _id, info } = quiz.userID;
            const { fullname, avatar } = info;
            if (!userID) {
                return;
            }
            if (!info) {
                return;
            }

            if (!rankingMap.has(userID)) {
                rankingMap.set(userID, { userID: _id, name: fullname, avatar, Score });
            } else {
                rankingMap.get(userID).Score += Score;
            }
        });

        const ranking = [...rankingMap.values()].sort((a, b) => b.Score - a.Score);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        return {
            rank: ranking.slice(startIndex, endIndex),
            totalItems: ranking.length
        };
    }
    // slect all exam by user`
    async getExamByUser(userID) {
        const trakingQuiz = await TrakingQuiz.find({ userID }).populate(
            {
                path: 'quizID',
                select: 'title points'
            }
        );
        if (!trakingQuiz) {
            throw new ForbiddenError('No TrakingQuiz found');
        }
        return trakingQuiz;
    }


    // Select all User by exam find Id exam 
    async getUserByExam(quizID, page = 1, limit = 10) {
        const trakingQuiz = await TrakingQuiz.find({ quizID }).populate({
            path: 'userID',
            select: 'info',
            populate: {
                path: 'info'
            }
        });

        if (!trakingQuiz) {
            throw new ForbiddenError('No TrakingQuiz found');
        }
        // Sắp xếp theo điểm số
        const rankingMap = new Map();
        trakingQuiz.forEach(quiz => {
            const { userID, Score } = quiz;
            if (!userID || !quiz?.userID?.info) {
                return;
            }
            // const { fullname, avatar } = info;
            if (!rankingMap.has(userID)) {
                rankingMap.set(userID, { name: quiz?.userID?.info?.fullname, avatar: quiz?.userID?.info?.avatar, email: quiz?.userID?.info?.email, Score });

            } else {
                rankingMap.get(userID).Score += Score;
            }
        });
        const ranking = [...rankingMap.values()].sort((a, b) => b.Score - a.Score);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        return {
            rank: ranking.slice(startIndex, endIndex),
            totalItems: ranking.length
        };
    }





}

module.exports = TrakingQuizServices;
