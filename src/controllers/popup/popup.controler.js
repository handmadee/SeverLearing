'use strict';

const { OK } = require("../../core/success.response");
const PopupService = require("./../../services/popup/popup.service");
const PopupService12 = new PopupService();



class PopupController {
    static async createPopup(req, res) {
        const file = req.file ? req.file.filename : null;
        const popupImage = `${process.env.LOCAL_HOST2}/uploads/${file}`;
        const postPopup = await PopupService12.create({
            popupImage
        });
        return new OK({
            message: "PopupService12 has been successfully created.",
            data: postPopup
        }).send(res);
    }


    static async getPopup(req, res) {
        return new OK({
            message: "PopupService12 have been successfully retrieved.",
            data: await PopupService12.getAll()
        }).send(res);
    }
    static async getPopupById(req, res) {
        return new OK({
            message: "PopupService12 has been successfully found.",
            data: await PopupService12.getById(req.params.id)
        }).send(res);
    }
    static async updatePopup(req, res) {
        const file = req.file ? req.file.filename : null;
        const popupImage = `${process.env.LOCAL_HOST2}/uploads/${file}`;

        return new OK({
            message: "PopupService12 has been successfully updated.",
            data: await PopupService12.update(req.params.id, { popupImage })
        }).send(res);
    }

    static async removePopup(req, res) {
        return new OK({
            message: "PopupService12 has been successfully removed.",
            data: await PopupService12.remove(req.params.id)
        }).send(res);
    }

}
module.exports = PopupController;


