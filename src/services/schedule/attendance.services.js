'use strict'
const { default: mongoose } = require('mongoose');
const ettendanceModel = require('../../models/shechedule/studentAttendance');
const BaseService = require("../base.service");

class StudentEttendanceService extends BaseService {
    constructor() {
        super(ettendanceModel);
    }
    // Service điểm danh 
    async importEnttendance(data) {
        return await ettendanceModel.insertMany(data);
    }
    // Tìm kiếm theo ngày tháng và ca học
    async getStudy(study, date) {
        return await ettendanceModel.find({ study: study, date: date }).populate('studentAccount').select('studentAccount attendance  reason');
    }
    // Thay đổi trạng thái điểm danh
    async changeAttendance(id, attendance) {
        console.log(id, attendance);
        return await ettendanceModel.findByIdAndUpdate(id, attendance, { new: true })
    }

    async getStudyByDate(date, date1, study) {
        return await ettendanceModel.aggregate([
            {
                $match: {
                    date: { $gte: new Date(date), $lte: new Date(date1) },
                    study: study
                }
            },
            {
                $lookup: {
                    from: 'studentShechedules',
                    localField: 'studentAccount',
                    foreignField: '_id',
                    as: 'studentAccount'
                }
            },
            // // Select thành các document riêng lẻ 
            {
                $unwind: '$studentAccount'
            },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'teacherAccount',
                    foreignField: '_id',
                    as: 'teacherAccount'
                }
            },
            // // Select thành các document riêng lẻ 
            {
                $unwind: '$teacherAccount'
            },
            {
                $group: {
                    _id: '$studentAccount._id',
                    fullname: { $first: '$studentAccount.fullname' },
                    phone: { $first: '$studentAccount.phone' },
                    study: { $first: '$studentAccount.study' },
                    teacher: { $first: '$teacherAccount.username' },
                    attendanceCount: { $sum: 1 },
                    attendanceCountTrue: {
                        $sum: { $cond: [{ $eq: ['$attendance', true] }, 1, 0] }
                    },
                    attendanceFalseCount: {
                        $sum: { $cond: [{ $eq: ['$attendance', false] }, 1, 0] }
                    }

                }
            },
            {
                $project: {
                    _id: 0, // Loại bỏ trường _id khỏi kết quả
                    accountID: '$_id',
                    fullname: 1,
                    teacher: 1,
                    phone: 1,
                    study: 1,
                    attendanceCountTrue: 1,
                    attendanceFalseCount: 1,
                    attendanceCount: 1 // Bao gồm trường đếm số lượng bản ghi
                }
            }
        ]);

    }
    // study by date teacher 
    async getStudyByDateTeacher(dateA, dateB, idTeacher) {
        console.log(typeof (dateA))
        console.log({
            message: 'Date A',
            date: typeof (dateA),
            dateB
        })
        try {
            const result = await ettendanceModel.aggregate([
                {
                    $match: {
                        date: { $gte: new Date(dateA), $lte: new Date(dateB) },
                        teacherAccount: new mongoose.Types.ObjectId(idTeacher)
                    }
                },
                {
                    $group: {
                        _id: {
                            study: "$study",
                            date: "$date",
                            teacherAccount: "$teacherAccount",

                        },
                        totalCount: { $sum: 1 },
                    }
                },
                {
                    $lookup: {
                        from: 'accounts',
                        localField: '_id.teacherAccount',
                        foreignField: '_id',
                        as: 'teacherAccountInfo'
                    }
                },
                {
                    $unwind: '$teacherAccountInfo'
                },
                {
                    $project: {
                        _id: 0,
                        teacherAccount: '$teacherAccountInfo.username',
                        // Nếu _id không chứa các trường study và date, bạn không thể truy cập chúng bằng $_id
                        study: '$_id.study',
                        date: '$_id.date',
                        totalCount: 1,
                    }
                }
            ]);

            console.log(result);
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    //
    async getAloneByAccount(studentAccount, date, date1, study) {
        console.error("Đúng ");
        console.log(studentAccount, date, date1, study);
        return await ettendanceModel.find({ studentAccount, date: { $gte: date, $lte: date1 }, study }).populate({
            path: 'studentAccount',
            select: 'fullname '
        }).select('studentAccount attendance date reason study ');
    }

    // del find account id 
    async delAccountID(studentAccount) {
        return await ettendanceModel.deleteMany({ studentAccount });
    }

    // Update many 
    async updateStudentMany({ _id, status, reason }) {
        await ettendanceModel.updateOne({
            _id
        }, { status: status, reason: reason });
    }

    //  date: { $gte: date, $lte: date1 },




}

module.exports = new StudentEttendanceService();