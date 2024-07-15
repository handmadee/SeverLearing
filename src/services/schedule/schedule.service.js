'use strict'
const { Types } = require('mongoose');
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

    async getStudy(study, days) {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const dayNow = `${year}-${month}-${day}`;

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
                studentAccount: new Types.ObjectId(person._id),
                date: '2024-07-13T17:00:00.000+00:00',
                study: study
            }).lean();
            if (!isChecked) {
                const data = await ShecheduleModel.find({ study, days }).lean();
                return {
                    status: true,
                    data
                };
            }

            const data = await studentAttendance.find({ study, date: new Date(dayNow) }).populate('studentAccount').lean();
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
    // Querry search 
    async searchStudents(keyword) {
        return await ShecheduleModel.find(
            { $text: { $search: keyword } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } });
    }






}

module.exports = new StudentShecheduleService();