
const fcmModel = require('../../models/firebase/fcmToken.model');
const BaseService = require('../base.service');



class fcmTokenService extends BaseService {
    constructor() {
        super(fcmModel);
    }
    // get all services and page them
    async getAllFcmToken(page = 1, limit = 10) {
        const totalToken = await fcmModel.countDocuments();
        const countPage = Math.ceil(totalToken / limit);
        const data = (await fcmModel.find().populate(
            {
                path: 'accountId',
                select: ' username ',
                populate: {
                    path: 'info',
                    select: 'email fullname'
                }
            }
        ).skip((page - 1) * limit).limit(limit))
        return { data, countPage, totalToken };
    };
    // find fcmToken by name accountId
    async getFcmToken(name) {
        try {
            const regex = new RegExp(name, 'i');
            const data = await fcmModel.find().populate({
                path: 'accountId',
                select: 'username',
                populate: {
                    path: 'info',
                    select: 'email fullname'
                }
            });

            // Lọc các tài liệu dựa trên fullname
            const filteredData = data.filter(item =>
                item.accountId &&
                item.accountId.info &&
                regex.test(item.accountId.info.fullname)
            );

            return filteredData;
        } catch (error) {
            console.error('Lỗi khi lấy FCM token:', error);
            throw error;
        }
    }




    //  
    async createFcmToken(fcmToken, accountId) {
        // find fcmToken by accountId
        const fcmTokenData = await fcmModel.findOne({ accountId });
        // if fcmToken is exist then update fcmToken
        if (fcmTokenData) {
            return await this.update(fcmTokenData._id, { fcmToken });
        }
        // if fcmToken is not exist then create fcmToken
        return await this.create({ fcmToken, accountId });
    }
    // Delete fcmToken by accountId
    async deleteFcmToken(accountId) {
        const fcmTokenData = await fcmModel.findOne({ accountId });
        if (fcmTokenData) {
            return await this.remove(fcmTokenData._id);
        }
        return null;
    }
}


module.exports = fcmTokenService;
