'use strict';

const mongoose = require('mongoose');
const Info = require('../../models/infor.model');
const accountModel = require('../../models/account.model');
const BaseService = require('../base.service');
const TrakingQuizServices = require('../trakingQuiz/TrakingQuiz.services');
const TrackingCourseService = require('../trackingCourse/trackingCourse.service');
const trackingQuiz = new TrakingQuizServices();



class InfoService extends BaseService {
    constructor() {
        super(Info);
    }
    async createInfoUser(data) {
        const { accountId } = data;
        const account = await accountModel.findById(accountId);
        if (!account) {
            throw new Error('Account not found');
        }
        const info = await Info.create(data);
        await accountModel.findByIdAndUpdate(accountId, { $set: { info: info._id } });
        return info;
    }
    async updateInfoUser(infoId, data) {
        const info = await Info.findById(infoId);
        if (!info) {
            throw new Error('Info not found');
        }
        const updatedInfo = await Info.findByIdAndUpdate(infoId, { $set: data }, { new: true });
        return updatedInfo;
    }
    // Phân trang hiển thị danh sách user 
    async getInfoUser(page = 1, limit = 10) {
        const info = await Info.find().skip((page - 1) * limit).limit(limit);
        return info;
    }
    // Đếm số lượng user
    async countUsers() {
        const totalItems = await Info.countDocuments();
        return totalItems;
    }
    // Hiển thị danh sách user đầy đủ thông tin
    async getInfoFullPage(page = 1, limit = 10) {
        try {
            const skipCount = (page - 1) * limit;
            const totalInfoCount = await Info.countDocuments(); // Số lượng toàn bộ thông tin

            const info = await Info.find().skip(skipCount).limit(limit);

            const infoWithAdditionalData = await Promise.all(info.map(async (item) => {
                const [score, isQuizTaken, course] = await Promise.all([
                    trackingQuiz.getScore(item.accountId),
                    trackingQuiz.checkQuizbyUser(item.accountId),
                    TrackingCourseService.getTrackingCourseByIdUser(item.accountId)
                ]);

                return {
                    ...item.toObject(),
                    score,
                    isQuizTaken,
                    course,
                };
            }));

            return {
                total: totalInfoCount,
                data: infoWithAdditionalData
            };
        } catch (error) {
            // Xử lý lỗi ở đây nếu cần thiết
            console.error("Error in getInfoFullPage:", error);
            throw error;
        }
    }

    // Delete User
    async deleteUserById(id) {
        const info = await Info.findById(id);
        if (!info) {
            throw new Error('Info not found');
        }
        await Info.findByIdAndDelete(id);
        return true;
    }


}

module.exports = new InfoService(Info);