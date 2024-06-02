'use state'

const { Created, OK } = require("../core/success.response")
const listNotification = require("../services/notification/listNotification")

class NotificationController {
    static async listNotification(req, res) {
        const notification = await listNotification.getNotificationFull()
        return new OK({
            message: "Notification retrieved successfully",
            data: notification
        }).send(res);
    }
    static async createNotification(req, res) {
        const image = req.file ? req.file.filename : null;
        const imageNotification = `${process.env.LOCAL_HOST2}/uploads/${image}`;
        const notification = await listNotification.create({
            ...req.body,
            urlImage: imageNotification
        })
        return new Created({
            message: "Notification created successfully",
            data: notification
        }).send(res);
    }
    static async deleteNotification(req, res) {
        await listNotification.remove(req.params.id)
        return new OK({
            message: "Notification removed successfully"
        }).send(res);
    }
    static async updateNotification(req, res) {
        const image = req.file ? req.file.filename : null;
        const imageNotification = `${process.env.LOCAL_HOST2}/uploads/${image}`;
        const notification = await listNotification.update(req.params.id, { urlImage: imageNotification })
        return new OK({
            message: "Notification updated successfully",
            data: notification
        }).send(res);
    }
}

module.exports = NotificationController;