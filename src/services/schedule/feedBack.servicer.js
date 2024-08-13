'use strict'

const { Types } = require("mongoose")
const moment = require('moment');
const feedBackStudent = require("../../models/shechedule/feedBackStudent")
const studentAttendance = require("../../models/shechedule/studentAttendance");
const { BadRequestError } = require("../../core/error.response");


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
    static async createFeedBack({
        idTeacher, idStudent, content
    }) {
        const currentYear = moment().year();
        const currentMonth = moment().month() + 1; // Lấy tháng hiện tại (cộng 1 vì tháng trong moment bắt đầu từ 0)
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
                contentFeedBack: content
            },
            {
                new: true,
                upsert: true
            }
        );
    }

    //
    static async getFeedBackByStudents({ idStudent }) {
        const listFeedBack = await feedBackStudent.findOne({
            studentsAccount: new Types.ObjectId(idStudent),
        }).lean();
        if (!listFeedBack) throw new BadRequestError("listFeedBack not found !!!");
        return listFeedBack;
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
        }).select("studentsAccount contentFeedBack createdAt").sort({ createdAt: -1 }).lean();
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
        }).select("studentsAccount teacherAccount contentFeedBack createdAt").sort({ createdAt: -1 }).lean();
        if (!listFeedBack) throw new BadRequestError("listFeedBack not found !!!");
        return listFeedBack;
    }

    // Edits for Feedback
    static async editFeedBack({ idFeedBack, content = "" }) {
        const feedBack = await feedBackStudent.findByIdAndUpdate(idFeedBack, {
            contentFeedBack: content
        }, { new: true }).lean();
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
        }).select("studentsAccount contentFeedBack createdAt").sort({ createdAt: -1 }).lean();
        if (!listFeedBack) throw new BadRequestError("listFeedBack not found !!!");
        return listFeedBack;
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
        }).select("studentsAccount teacherAccount contentFeedBack createdAt").sort({ createdAt: -1 }).lean();
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
        }).select("studentsAccount teacherAccount contentFeedBack createdAt").sort({ createdAt: -1 }).lean();
        if (!listFeedBack) throw new BadRequestError("listFeedBack not found !!!");
        return listFeedBack;
    }



}

module.exports = feedBackStudentService;



