'use strict'
const { default: mongoose, Types } = require('mongoose');
const ettendanceModel = require('../../models/shechedule/studentAttendance');
const BaseService = require("../base.service");
const accountModel = require('../../models/account.model');
const { NotFoundError, BadRequestError } = require('../../core/error.response');
const ClassService = require('./class.services');
const { formatDateTime } = require('../../untils/time.untils');

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
        return await ettendanceModel.find({ study: study, date: date }).populate('studentAccount').select('studentAccount attendance  reason').lean();
    }

    async getStudyByTeacher(study, date, idTeacher) {
        // Lấy thông tin class hiện tại
        const classNow = await ClassService.getTeachetClass({
            study,
            idTeacher
        });
        if (!classNow) return [];
        const teacherAccounts = classNow.teacherAccount.map(acc => acc.toString());
        const attendanceRecords = await ettendanceModel.find({
            study: +study,
            date: new Date(date),
            teacher_account_used: { $in: teacherAccounts }
        })
            .populate('studentAccount')
            .select('studentAccount attendance reason')
            .lean();
        return attendanceRecords.length > 0 ? attendanceRecords : [];
    }
    // Thay đổi trạng thái điểm danh
    async changeAttendance(id, attendance) {
        console.log(id, attendance);
        return await ettendanceModel.findByIdAndUpdate({
            _id: new mongoose.Types.ObjectId(id)
        }, {
            attendance: attendance.attendance
        }, { new: true })
    }
    
    async getAbsentStudents(study = null, fromDate, toDate, session = null, teacherId = null) {
        const query = {
            date: { $gte: fromDate, $lte: toDate },
            // attendance: false
        };

        if (study) {
            query.study = study;
        }

        if (session) {
            query.session = session;
        }

        if (teacherId) {
            query.teacherAccount = new mongoose.Types.ObjectId(teacherId);
        }

        const absents = await ettendanceModel.find(query)
            .populate('studentAccount')
            .select('studentAccount date reason attendance  study _id ')
            .lean();

        const studentMap = {};

        for (const record of absents) {
            const studentId = record.studentAccount?._id?.toString();
            const fullname = record.studentAccount?.fullname || 'Không rõ tên';
            console.log(record)
            const study = record.study;
            const id = record._id;
            const desC = record.reason;
            const date = record.date;

            if (!studentMap[studentId]) {
                studentMap[studentId] = {
                    studentId,
                    fullname,
                    des: desC,
                    totalAbsent: 0,
                    absentDates: []
                };
            }

            if(record.attendance == false) {
                studentMap[studentId].totalAbsent++;
            }
            studentMap[studentId].absentDates.push({
                id,
                status: record.attendance,
                lable: `${formatDateTime(date)} - Ca học : ${study}`,
                date: formatDateTime(date),
                study: record.study,
                reason: desC
            });
        }

        return Object.values(studentMap);
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
    async getStudyByDateTeacher1(dateA, dateB, idTeacher) {
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
    // study by date teacher 1
    async getStudyByDateTeacherV1(dateA, dateB, idTeacher) {
        // find Id Teacher 
        const { username } = await accountModel.findOne({
            _id: new Types.ObjectId(idTeacher)
        }).select({
            username: 1
        }).lean();
        if (!username) NotFoundError("ID techer not exits");

        try {
            const result = await ettendanceModel.aggregate([
                {
                    $match: {
                        date: { $gte: new Date(dateA), $lte: new Date(dateB) },
                        $or: [
                            { teacherAccount: new mongoose.Types.ObjectId(idTeacher) },
                            { teacher_account_used: { $elemMatch: { $eq: idTeacher } } }
                        ]
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
                        teacherAccount: username == '$teacherAccountInfo.username' ? username : username + "-" + '$teacherAccountInfo.username',
                        study: '$_id.study',
                        date: '$_id.date',
                        totalCount: 1,
                    }
                },
                {
                    $sort: {
                        date: -1
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

    // V1 

    async getStudyByDateTeacher(dateA, dateB, idTeacher) {
        try {
            // find Id Teacher 
            const teacher = await accountModel.findOne({
                _id: new Types.ObjectId(idTeacher)
            }).select({
                username: 1
            }).lean();

            if (!teacher || !teacher.username) {
                throw new Error("ID teacher not exists");
            }

            const username = teacher.username;

            const result = await ettendanceModel.aggregate([
                {
                    $match: {
                        date: { $gte: new Date(dateA), $lte: new Date(dateB) },
                        $or: [
                            { teacherAccount: new mongoose.Types.ObjectId(idTeacher) },
                            { teacher_account_used: { $elemMatch: { $eq: idTeacher } } }
                        ]
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
                    $addFields: {
                        teacherAccount: {
                            $cond: {
                                if: { $eq: [username, "$teacherAccountInfo.username"] },
                                then: username,
                                else: { $concat: [username, " -- ", "$teacherAccountInfo.username"] }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        teacherAccount: 1,
                        study: '$_id.study',
                        date: '$_id.date',
                        totalCount: 1,
                    }
                },
                {
                    $sort: {
                        date: -1
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

    // t2
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
        // update teacher 
        // 

        await ettendanceModel.updateOne({
            _id
        }, { status: status, reason: reason });
    }

    //  date: { $gte: date, $lte: date1 },

    // update by teacher  
    async updateStudentManyByTeacher({ _id, idTeacher, attendance, reason }) {
        return await ettendanceModel.findOneAndUpdate(
            { _id },
            {
                $set: {
                    attendance,
                    reason: reason
                },
                $addToSet: {
                    teacher_account_used: idTeacher
                }
            },
            { new: true }
        );
    }





}

module.exports = new StudentEttendanceService();