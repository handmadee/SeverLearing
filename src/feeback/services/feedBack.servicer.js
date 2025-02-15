'use strict'

const { Types } = require("mongoose")
const moment = require('moment');
const studentAttendance = require("../../models/shechedule/studentAttendance");
const { BadRequestError } = require("../../core/error.response");
const feedBackStudent = require("../models/feedBackStudent");



class feedBackStudentService {
    static async createFeedBackv3({
        idTeacher, idStudent, content
    }) {
        return await feedBackStudent.create({
            teacherAccount: new Types.ObjectId(idTeacher),
            studentsAccount: new Types.ObjectId(idStudent),
            contentFeedBack: content
        })
    }

    // V2 
    static async createFeedBack(payload) {
        const {
            idTeacher, idStudent, content,
        } = payload;
        const currentYear = moment().year();
        const currentMonth = moment().month() + 1;
        const startDate = moment(`${currentYear}-${currentMonth}`, 'YYYY-M').startOf('month').toDate();
        const endDate = moment(`${currentYear}-${currentMonth}`, 'YYYY-M').endOf('month').toDate();

        const query = {
            teacherAccount: new Types.ObjectId(idTeacher),
            studentsAccount: new Types.ObjectId(idStudent),
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        };

        return await feedBackStudent.findOneAndUpdate(
            query,
            {
                ...payload,
                contentFeedBack: content
            },
            {
                new: true,
                upsert: true
            }
        );
    }

    static async createBulkFeedback(payloads) {
        if (!Array.isArray(payloads) || payloads.length === 0) {
            throw new Error('Payloads phải là một mảng không rỗng.');
        }
        const currentYear = moment().year();
        const currentMonth = moment().month() + 1;
        const startDate = moment(`${currentYear}-${currentMonth}`, 'YYYY-M').startOf('month').toDate();
        const endDate = moment(`${currentYear}-${currentMonth}`, 'YYYY-M').endOf('month').toDate();

        // Chuẩn bị các thao tác bulk
        const bulkOps = payloads.map(payload => {
            const { idTeacher, idStudent, content, ...otherFields } = payload;

            // Kiểm tra các trường bắt buộc
            if (!idTeacher || !idStudent) {
                throw new Error('Mỗi payload phải bao gồm idTeacher, idStudent, và content.');
            }
            return {
                updateOne: {
                    filter: {
                        teacherAccount: new Types.ObjectId(idTeacher),
                        studentsAccount: new Types.ObjectId(idStudent),
                        createdAt: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    },
                    update: {
                        $set: {
                            ...otherFields,
                            contentFeedBack: content,
                            teacherAccount: new Types.ObjectId(idTeacher),
                            studentsAccount: new Types.ObjectId(idStudent),
                            createdAt: new Date()
                        }
                    },
                    upsert: true
                }
            };
        });

        try {
            const bulkWriteResult = await feedBackStudent.bulkWrite(bulkOps, { ordered: false });
            return bulkWriteResult;
        } catch (error) {
            console.error('Lỗi khi thực hiện bulkWrite:', error);
            throw error;
        }
    }

    static async getFeedBackByStudents({ idStudent }) {
        const listFeedBack = await feedBackStudent.findOne({
            studentsAccount: new Types.ObjectId(idStudent),
        }).populate('subjectScores.languageIt').lean();
        if (!listFeedBack) throw new BadRequestError("listFeedBack not found !!!");
        return listFeedBack;
    }

    //
    static async getAlwaysFeedbackByStudents(idStudent) {
        const currentYear = moment().year();
        const startDate = moment(`${currentYear}`, 'YYYY').startOf('year').toDate();
        const endDate = moment(`${currentYear}`, 'YYYY').endOf('year').toDate();
        const listFeedBack = await feedBackStudent.find({
            studentsAccount: new Types.ObjectId(idStudent),
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }, {
            createdAt: 1,
            _id: 0
        });
        if (listFeedBack && listFeedBack.length > 0) {
            return listFeedBack.map(feedback => ({
                createdAt: feedback.createdAt,
                month: moment(feedback.createdAt).month() + 1
            }));
        } else {
            return [];
        }
    }


    // Select for date
    static async getFeedBackByStudentsForMonth({ idStudent, month }) {
        const currentYear = moment().year();
        const startDate = moment(`${currentYear}-${month}`, 'YYYY-M').startOf('month').toDate();
        const endDate = moment(`${currentYear}-${month}`, 'YYYY-M').endOf('month').toDate();
        console.log({
            startDate, endDate
        })
        const listFeedBack = await feedBackStudent.find({
            studentsAccount: new Types.ObjectId(idStudent),
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate({
            path: "studentsAccount",
            select: "fullname"
        }).select("studentsAccount contentFeedBack createdAt skill thinking subjectScores   ").sort({ createdAt: -1 }).populate('subjectScores.languageIt').lean();
        if (!listFeedBack) throw new BadRequestError("listFeedBack not found !!!");
        return listFeedBack;
    }

    static async getFeedBackByTeacherForMonth({ idTeacher, month }) {
        const currentYear = moment().year();
        const startDate = moment(`${currentYear}-${month}`, 'YYYY-M').startOf('month').toDate();
        const endDate = moment(`${currentYear}-${month}`, 'YYYY-M').endOf('month').toDate();
        console.log({
            startDate, endDate
        })
        const listFeedBack = await feedBackStudent.find({
            teacherAccount: new Types.ObjectId(idTeacher),
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate({
            path: "studentsAccount",
            select: "fullname"
        }).populate({
            path: "teacherAccount",
            select: "username"
        }).select("studentsAccount contentFeedBack createdAt skill thinking subjectScores ").sort({ createdAt: -1 }).populate('subjectScores.languageIt').lean();
        if (!listFeedBack) throw new BadRequestError("listFeedBack not found !!!");
        return listFeedBack;
    }

    // Edits for Feedback
    static async editFeedBack({ idFeedBack, content }) {
        const feedBack = await feedBackStudent.findByIdAndUpdate(idFeedBack, content, { new: true }).lean();
        if (!feedBack) throw new BadRequestError("listFeedBack not exits !!!");
        return feedBack;
    }

    static async removeFeedBack({ idFeedBack }) {
        const feedBack = await feedBackStudent.findByIdAndDelete(idFeedBack).lean();
        if (!feedBack) throw new BadRequestError("listFeedBack not exits !!!");
        return feedBack;
    }

    static async getAllFeedBackByID({ idStudent }) {
        const listFeedBack = await feedBackStudent.find({
            studentsAccount: new Types.ObjectId(idStudent),
        }).populate({
            path: "studentsAccount",
            select: "fullname"
        }).select("studentsAccount contentFeedBack createdAt skill thinking subjectScores ").sort({ createdAt: -1 }).populate('subjectScores.languageIt').lean();

        console.log(listFeedBack);

        if (!listFeedBack) throw new BadRequestError("listFeedBack not found !!!");
        return listFeedBack;
    }


    static async getAllFeedBackByIDV2({ idStudent }) {
        try {
            const listFeedBack = await feedBackStudent.find({
                studentsAccount: new Types.ObjectId(idStudent),
            })
                .populate({
                    path: "studentsAccount",
                    select: "fullname"
                })
                .select("studentsAccount contentFeedBack createdAt skill thinking subjectScores")
                .sort({ createdAt: -1 })
                .populate({
                    path: 'subjectScores.languageIt',
                    select: "nameCode describe"
                })
                .lean();

            if (!listFeedBack || listFeedBack.length === 0) {
                throw new BadRequestError("listFeedBack not found !!!");
            }

            // Aggregation logic
            const summary = {
                scoresByLevelAndLanguage: [],
                skillCount: {},
                thinkingCount: {},
                feedbackContent: []
            };

            const scoresMap = new Map();

            listFeedBack.forEach(feedback => {
                // Aggregate scores by level and language
                if (feedback.subjectScores && Array.isArray(feedback.subjectScores)) {
                    feedback.subjectScores.forEach(score => {
                        const level = score.level;
                        const language = score.languageIt?.nameCode || 'Unknown';
                        const scoreValue = score.score || 0;

                        const key = `${level}-${language}`;
                        if (!scoresMap.has(key)) {
                            scoresMap.set(key, {
                                level,
                                language,
                                totalScore: 0
                            });
                        }
                        scoresMap.get(key).totalScore += scoreValue;
                    });
                }
                // Count skill occurrences
                const skill = feedback.skill || 'Unknown';
                if (!summary.skillCount[skill]) {
                    summary.skillCount[skill] = 0;
                }
                summary.skillCount[skill]++;

                // Count thinking occurrences
                const thinking = feedback.thinking || 'Unknown';
                if (!summary.thinkingCount[thinking]) {
                    summary.thinkingCount[thinking] = 0;
                }
                summary.thinkingCount[thinking]++;

                // Collect feedback content
                if (feedback.contentFeedBack) {
                    summary.feedbackContent.push(feedback.contentFeedBack);
                }
            });

            // Convert scoresMap to array format
            summary.scoresByLevelAndLanguage = Array.from(scoresMap.values());
            mary.skillCount['']
            return summary;
        } catch (error) {
            console.error("Error fetching feedback:", error);
            throw new Error("An error occurred while fetching feedback");
        }
    }



    static async getFeedBackForMonth({ month }) {
        const currentYear = moment().year();
        const startDate = moment(`${currentYear}-${month}`, 'YYYY-M').startOf('month').toDate();
        const endDate = moment(`${currentYear}-${month}`, 'YYYY-M').endOf('month').toDate();
        console.log({
            startDate, endDate
        })
        const listFeedBack = await feedBackStudent.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate({
            path: "studentsAccount",
            select: "fullname"
        }).populate({
            path: "teacherAccount",
            select: "username"
        }).select("studentsAccount contentFeedBack createdAt skill thinking subjectScores ").sort({ createdAt: -1 }).populate('subjectScores.languageIt').lean();
        if (!listFeedBack) throw new BadRequestError("listFeedBack not found !!!");
        return listFeedBack;
    }

    static async getFeedAllBackTeacher({ idTeacher }) {
        const listFeedBack = await feedBackStudent.find({
            teacherAccount: new Types.ObjectId(idTeacher),
        }).populate({
            path: "studentsAccount",
            select: "fullname"
        }).populate({
            path: "teacherAccount",
            select: "username"
        }).select("studentsAccount contentFeedBack createdAt skill thinking subjectScores ").sort({ createdAt: -1 }).populate('subjectScores.languageIt').lean();
        if (!listFeedBack) throw new BadRequestError("listFeedBack not found !!!");
        return listFeedBack;
    }

    static async getFeedById(id) {
        return await feedBackStudent.findById(id).populate({
            path: "studentsAccount",
            select: "fullname phone"
        }).populate('subjectScores.languageIt').lean();
    }



}

module.exports = feedBackStudentService;



