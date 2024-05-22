const fcmModel = require('../../models/firebase/fcmToken');
const BaseService = require('../base.service');
const admin = require('../../configs/config.firebase');
const schedule = require('node-schedule');

class NotificationService extends BaseService {
    constructor() {
        super(fcmModel);
    }

    // Hàm tạo thông điệp gửi đi
    createMessage(data) {
        const { title, image, body, token } = data;
        return {
            notification: {
                title,
                body,
                image
            },
            android: {
                notification: {
                    image
                }
            },
            apns: {
                payload: {
                    aps: {
                        'mutable-content': 1
                    }
                },
                fcm_options: {
                    image
                }
            },
            tokens: token
        };
    }

    // Hàm gửi thông báo ngay lập tức
    async sendNotification(data) {
        const message = this.createMessage(data);
        try {
            const response = await admin.messaging().sendMulticast(message);
            console.log('Gửi thông điệp thành công:', response);
        } catch (error) {
            console.error('Lỗi khi gửi thông điệp:', error);
            throw new Error('Không thể gửi thông báo');
        }
    }

    // Hàm lên lịch gửi thông báo
    async scheduleNotification(date, message) {
        schedule.scheduleJob(date, async () => {
            try {
                const response = await admin.messaging().sendMulticast(message);
                console.log('Gửi thông điệp thành công:', response);
            } catch (error) {
                console.error('Lỗi khi gửi thông điệp:', error);
                throw new Error('Không thể gửi thông báo');
            }
        });
    }

    // Hàm gửi thông báo vào một thời gian cụ thể
    async sendNotificationAtSpecificDate(data, date) {
        const message = this.createMessage(data);
        const scheduledDate = new Date(date);
        await this.scheduleNotification(scheduledDate, message);
    }

    // Hàm gửi thông báo hàng tháng vào một ngày cụ thể
    async sendMonthlyNotifications(data, dayOfMonth) {
        const message = this.createMessage(data);
        for (let month = 0; month < 12; month++) {
            const date = new Date(2024, month, dayOfMonth, 20, 0, 0);
            await this.scheduleNotification(date, message);
        }
    }

    // Hàm gửi thông báo hàng ngày vào thời gian cụ thể
    async sendDailyNotifications(data, dailyTime) {
        const message = this.createMessage(data);
        schedule.scheduleJob(dailyTime, async () => {
            try {
                const response = await admin.messaging().sendMulticast(message);
                console.log('Gửi thông điệp thành công:', response);
            } catch (error) {
                console.error('Lỗi khi gửi thông điệp:', error);
                throw new Error('Không thể gửi thông báo');
            }
        });
    }
}

module.exports = NotificationService;
