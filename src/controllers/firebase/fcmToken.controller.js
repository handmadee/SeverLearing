const fcmTokenService = require("../../services/firebase/fcmToken.firebase.services");
const fcmDevice = new fcmTokenService();

const { OK } = require('./../../core/success.response'
);


class fcmTokenController {
    static async createFcmToken(req, res) {
        const { fcmToken, accountId } = req.body;
        console.log(fcmToken, accountId)
        return new OK({
            message: "FcmToken created successfully",
            data: await fcmDevice.createFcmToken(fcmToken, accountId)
        }).send(res);
    }
    static async getFcmToken(req, res) {
        return new OK({
            message: "FcmToken fetched successfully",
            data: await fcmDevice.getAll()
        }).send(res);
    }
    static async getFcmTokenById(req, res) {
        const { id } = req.params;
        return new OK({
            message: "FcmToken fetched successfully",
            data: await fcmDevice.getById(id)
        }).send(res);
    }
    static async updateFcmToken(req, res) {
        const { id } = req.params;
        const { fcmToken, accountId } = req.body;
        const data = {
            fcmToken: fcmToken,
            accountId: accountId
        }
        return new OK({
            message: "FcmToken updated successfully",
            data: await fcmDevice.update(id, data)
        }).send(res);
    }
    static async deleteFcmToken(req, res) {
        const { id } = req.params;
        return new OK({
            message: "FcmToken deleted successfully",
            data: await fcmDevice.remove(id)
        }).send(res);
    }
    // Delete fcmToken by accountId
    static async deleteFcmTokenByAccountId(req, res) {
        const { accountId } = req.params;
        return new OK({
            message: "FcmToken deleted successfully",
            data: await fcmDevice.deleteFcmToken(accountId)
        }).send(res);
    }

    // Search token by name accountID 
    static async searchFcmToken(req, res) {
        const { name } = req.query;
        return new OK({
            message: "FcmToken fetched successfully",
            data: await fcmDevice.getFcmToken(name)
        }).send(res);
    }

}

module.exports = fcmTokenController;