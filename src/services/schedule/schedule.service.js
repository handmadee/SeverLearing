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
    async getStudy(study, days) {
        return await ShecheduleModel.find({ study, days });
    }




}

module.exports = new StudentShecheduleService();