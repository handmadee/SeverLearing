'use strict'
const studentAttendance = require('../../models/shechedule/studentAttendance');
const ShecheduleModel = require('../../models/shechedule/studentShechedule.model');
const BaseService = require("../base.service");

class StudentShecheduleService extends BaseService {
    constructor() {
        super(ShecheduleModel);
    }
    async getAllShechedule(page = 1, limit = 10) {
        const total = await ShecheduleModel.countDocuments();
        const totalPages = Math.ceil(total / limit);
        const data = await ShecheduleModel.find().skip((page - 1) * limit).limit(limit);
        return {
            data,
            total,
            totalPages
        }
    }
    async importStudents(data) {
        return await ShecheduleModel.insertMany(data);
    }
    // Get days and Study
    // async getStudy(study, days) {
    //     try {
    //         const dayNow = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
    //         console.log({
    //             message: 'Delete dayNow',
    //             date: dayNow
    //         });
    //         const person = await ShecheduleModel.findOne({ study, days });
    //         if (!person) return {
    //             status: true,
    //             data: []
    //         };
    //         console.log({
    //             message: 'Delete isChecked',
    //             studentAccount: person._id,
    //             date: days
    //         });
    //         const isChecked = await studentAttendance.findOne({
    //             studentAccount: person._id,
    //             date: dayNow
    //         });


    //         console.log({
    //             message: 'Delete isChecked',
    //             dayNow: dayNow,
    //             isChecked: isChecked
    //         });

    //         if (!isChecked) {
    //             const data = await ShecheduleModel.find({ study, days });
    //             return {
    //                 status: true,
    //                 data
    //             }

    //         }
    //         const data = await studentAttendance.find({ study, date: dayNow }).populate('studentAccount');
    //         return {
    //             status: false,
    //             data
    //         };
    //     } catch (error) {
    //         console.error('Error in getStudy:', error);
    //         return [];
    //     }
    // }


    // v2 
    async getStudy(study, days) {
        try {
            const dayNow = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
            console.log({
                message: 'Ngày hiện tại',
                date: dayNow
            });

            const person = await ShecheduleModel.findOne({ study, days }).lean();
            if (!person) {
                return {
                    status: true,
                    data: []
                };
            }


            console.log({
                message: 'Tìm thấy người',
                studentAccount: person._id,
                date: days
            });

            const isChecked = await studentAttendance.findOne({
                studentAccount: person._id,
                date: dayNow
            }).lean();

            console.log({
                message: 'Kiểm tra điểm danh',
                dayNow: dayNow,
                isChecked: isChecked
            });

            if (!isChecked) {
                const data = await ShecheduleModel.find({ study, days }).lean();
                return {
                    status: true,
                    data
                };
            }

            const data = await studentAttendance.find({ study, date: dayNow }).populate('studentAccount').lean();
            return {
                status: false,
                data
            };
        } catch (error) {
            console.error('Lỗi trong getStudy:', error);
            return {
                status: false,
                error: error.message,
                data: []
            };
        }
    }






}

module.exports = new StudentShecheduleService();