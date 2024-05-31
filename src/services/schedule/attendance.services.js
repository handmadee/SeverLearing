'use strict'
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
        return await ettendanceModel.find({ study, date }).populate('studentAccount').select('studentAccount attendance ');
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
                $group: {
                    _id: '$studentAccount._id',
                    fullname: { $first: '$studentAccount.fullname' },
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
                    attendanceCountTrue: 1,
                    attendanceFalseCount: 1,
                    attendanceCount: 1 // Bao gồm trường đếm số lượng bản ghi
                }
            }
        ]);

    }
    //
    async getAloneByAccount(studentAccount, date, date1, study) {
        console.error("Đúng ");
        console.log(studentAccount, date, date1, study);

        return await ettendanceModel.find({ studentAccount, date: { $gte: date, $lte: date1 }, study }).populate({
            path: 'studentAccount',
            select: 'fullname'
        }).select('studentAccount attendance date');
    }



    //  date: { $gte: date, $lte: date1 },




}

module.exports = new StudentEttendanceService();