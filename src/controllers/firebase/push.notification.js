const NotificationService = require('./../../services/firebase/notification.firebase.services');
const notificationService = new NotificationService();
const { OK } = require('./../../core/success.response'
);

const sendNotification = async (req, res) => {
    const { title, image, body, token } = req.body;
    const data = {
        title: title,
        image: image,
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

module.exports = {
    sendNotification
}