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
        if (!trakingQuiz || trakingQuiz.length === 0) {
            throw new ForbiddenError('No TrakingQuiz found');
        }
        return trakingQuiz.reduce((total, item) => total + item.Score, 0);
    }

    async getRanking() {
        const trakingQuiz = await TrakingQuiz.find().populate({
            path: 'userID',
            populate: {
                path: 'info',
                select: 'fullname avatar'
            }
        });
        if (!trakingQuiz || trakingQuiz.length === 0) {
            throw new ForbiddenError('No TrakingQuiz found');
        }

        const rankingMap = new Map();
        trakingQuiz.forEach(quiz => {
            const { userID, Score } = quiz;
            const { _id, info } = quiz.userID;
            const { fullname, avatar } = info;

            if (!rankingMap.has(userID)) {
                rankingMap.set(userID, { userID: _id, name: fullname, avatar, Score });
            } else {
                rankingMap.get(userID).Score += Score;
            }
        });

        const ranking = [...rankingMap.values()].sort((a, b) => b.Score - a.Score);
        return ranking;
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

        if (!trakingQuiz || trakingQuiz.length === 0) {
            throw new ForbiddenError('No TrakingQuiz found for this week');
        }

        const rankingMap = new Map();
        trakingQuiz.forEach(quiz => {
            const { userID, Score } = quiz;
            const { _id, info } = quiz.userID;
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
            const userRank = ranking.findIndex(user => user.userID == userID);
            if (userRank === -1) {
                throw new Error('User not found in ranking');
            }
            return userRank + 1;
        } catch (error) {
            console.error('Error getting user rank:', error);
            throw error;
        }
    }
}

module.exports = TrakingQuizServices;
