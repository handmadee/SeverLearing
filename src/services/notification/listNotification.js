const notificationModel = require("../../models/notification.model");
const BaseService = require("./../base.service");

class NotificationService extends BaseService {
    constructor() {
        super(notificationModel);
    }
    getNotificationFull() {
        return notificationModel.find().select('_id  urlImage').exec();
    }
}

module.exports = new NotificationService();