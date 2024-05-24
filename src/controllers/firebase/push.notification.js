const NotificationService = require('./../../services/firebase/notification.firebase.services');
const notificationService = new NotificationService();
const { OK } = require('./../../core/success.response'
);

class NotificationFireBaseControler {
    static async sendNotification(req, res) {
        const file = req.file ? req.file.filename : null;
        const imageCourse = `${process.env.LOCAL_HOST2}/uploads/${file}`;
        const { title, body, token } = req.body;

        //  link url image 
        const data = {
            title: title,
            image: imageCourse,
            body: body,
            token: token
        }
        console.log({
            data: data
        })
        return new OK({
            message: "Notification sent successfully",
            data: await notificationService.sendNotification(data)
        }).send(res);

    }

    static async scheduleNotification(req, res) {
        const file = req.file ? req.file.filename : null;
        const imageCourse = `${process.env.LOCAL_HOST2}/uploads/${file}`;
        const { date, title, body, token, jobId } = req.body;
        const data = {
            title, image: imageCourse, body, token
        };
        return new OK({
            message: "Notification scheduled successfully",
            data: await notificationService.sendNotificationAtSpecificDate(data, date, jobId)
        }).send(res);
    }

    // send date in month 
    static async scheduleNotificationMonth(req, res) {
        const file = req.file ? req.file.filename : null;
        const imageCourse = `${process.env.LOCAL_HOST2}/uploads/${file}`;
        const { dayOfMonth, title, body, token, hour, minute, jobId } = req.body;
        const data = {
            title, image: imageCourse, body, token
        }
        return new OK({
            message: "Notification scheduled successfully",
            data: await notificationService.sendMonthlyNotifications(data, dayOfMonth, jobId, hour, minute)
        }).send(res);
    }
    // gửi các thông báo hằng ngày 
    static async scheduleNotificationDaily(req, res) {
        // dailyTime format: {hour: 0, minute: 0, second: 0}
        const file = req.file ? req.file.filename : null;
        const imageCourse = `${process.env.LOCAL_HOST2}/uploads/${file}`;
        const { title, body, token, hour, jobId } = req.body;
        const data = {
            title, image: imageCourse, body, token
        }
        const hours = parseInt(hour);
        return new OK({
            message: "Notification scheduled successfully",
            data: await notificationService.sendDailyNotifications(data, hours, jobId)
        }).send(res);
    }

    // huỷ bỏ thông báo 
    static async cancelNotification(req, res) {
        const { jobId } = req.params;
        return new OK({
            message: "Notification cancelled successfully",
            data: await notificationService.cancelScheduledJob(jobId)
        }).send(res);
    }
    // getAllJob\
    static async getAllJob(req, res) {
        return new OK({
            message: "All jobs fetched successfully",
            data: await notificationService.getAll()
        }).send(res);
    }






}


module.exports = NotificationFireBaseControler;