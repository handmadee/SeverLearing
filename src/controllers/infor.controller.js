// file: src/controllers/infoController.js
const InfoService = require("../services/account/Info.service");
const { OK, Created } = require("../core/success.response");

class InfoController {
    static async createInfoUser(req, res, next) {
        try {
            const file = req.file ? req.file.filename : null;
            const avatar = `${process.env.LOCAL_HOST2}/uploads/${file}`;
            const createdInfo = await InfoService.createInfoUser({ ...req.body, avatar });
            return new Created({
                message: 'Create info success',
                data: createdInfo
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async getInfoUser(req, res, next) {
        try {
            const allInfo = await InfoService.getAll();
            return new OK({
                message: 'Get info success',
                data: allInfo
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async editInfoUser(req, res, next) {
        try {
            let updateData = { ...req.body };
            const file = req.file ? req.file.filename : null;
            if (file) {
                const avatar = `${process.env.LOCAL_HOST2}/uploads/${file}`;
                updateData.avatar = avatar;
            }
            const updatedInfo = await InfoService.updateInfoUser(req.params.id, updateData);
            return new OK({
                message: 'Edit info success',
                data: updatedInfo
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Get full pagr 
    static async getFullInfoUser(req, res, next) {
        return new OK({
            message: "Get full info success",
            data: await InfoService.getInfoFullPage()
        }).send(res);
    }

    static async deleteInfoUser(req, res, next) {
        try {
            const deletedInfo = await InfoService.deleteUserById(req.params.id);
            return new OK({
                message: 'Delete info success',
                data: deletedInfo
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
}


module.exports = InfoController;
