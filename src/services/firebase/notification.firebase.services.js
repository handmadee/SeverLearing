
const JobModel = require('../../models/firebase/JobModel.model');
const BaseService = require('../base.service');
const admin = require('../../configs/config.firebase');
const schedule = require('node-schedule');


class NotificationService extends BaseService {
    constructor() {
        super(JobModel);
        this.scheduledJobs = {};
        this.loadScheduledJobs();
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
    // Hàm lên lịch gửi thông báo và lưu vào cơ sở dữ liệu
    async scheduleNotification(date, data, jobId) {
        console.log('date', date, data, jobId);
        const message = this.createMessage(data);
        const job = schedule.scheduleJob(date, async () => {
            try {
                const response = await admin.messaging().sendMulticast(message);
                console.log('Gửi thông điệp thành công:', response);
            } catch (error) {
                console.error('Lỗi khi gửi thông điệp:', error);
                throw new Error('Không thể gửi thông báo');
            }
        });

        // Lưu công việc đã lên lịch với jobId
        this.scheduledJobs[jobId] = job;

        // Lưu công việc vào cơ sở dữ liệu
        const newJob = new JobModel({ jobId, date, data });
        await newJob.save();
    }

    // Hàm tải các công việc đã lên lịch từ cơ sở dữ liệu khi khởi động
    async loadScheduledJobs() {
        const jobs = await JobModel.find({});
        jobs.forEach(job => {
            const message = this.createMessage(job.data);
            const scheduledDate = new Date(job.date);
            const scheduledJob = schedule.scheduleJob(scheduledDate, async () => {
                try {
                    const response = await admin.messaging().sendMulticast(message);
                    console.log('Gửi thông điệp thành công:', response);
                } catch (error) {
                    console.error('Lỗi khi gửi thông điệp:', error);
                    throw new Error('Không thể gửi thông báo');
                }
            });

            // Lưu công việc đã lên lịch với jobId
            this.scheduledJobs[job.jobId] = scheduledJob;
        });
    }

    // Hàm gửi thông báo vào một thời gian cụ thể
    async sendNotificationAtSpecificDate(data, date, jobId) {
        const scheduledDate = new Date(date);
        try {
            await this.scheduleNotification(scheduledDate, data, jobId);
        } catch (error) {
            console.error('Lỗi khi lên lịch thông báo:', error);
        }
    }

    // Hàm gửi thông báo hàng tháng vào một ngày cụ thể
    async sendMonthlyNotifications(data, dayOfMonth, job, hour = 20, minute = 0) {
        for (let month = 1; month < 13; month++) {
            const currentYear = new Date().getFullYear();
            const date = new Date(currentYear, month, dayOfMonth, hour, minute, 0);
            await this.scheduleNotification(date, data, `${job}-${dayOfMonth}-${month}`);
        }
    }

    // Hàm gửi thông báo hàng ngày vào thời gian cụ thể
    async sendDailyNotifications(data, hours, jobId) {
        const message = this.createMessage(data);
        // 0 giây hours giờ * ngày * tháng * năm 
        const job = schedule.scheduleJob(`0 ${hours} * * *`, async () => {
            try {
                const response = await admin.messaging().sendMulticast(message);
                console.log('Gửi thông điệp thành công:', response);
            } catch (error) {
                console.error('Lỗi khi gửi thông điệp:', error);
                throw new Error('Không thể gửi thông báo');
            }
        });
        // Lưu công việc đã lên lịch với daily job id
        this.scheduledJobs['daily'] = job;
        // Lưu công việc hàng ngày vào cơ sở dữ liệu
        const newJob = new JobModel({ jobId, date: new Date(), data });
        await newJob.save();
    }


    // Hàm hủy bỏ công việc đã lên lịch và xóa khỏi cơ sở dữ liệu
    async cancelScheduledJob(jobId) {
        const job = await JobModel.findByIdAndDelete(jobId);
        if (!job) {
            console.log(`Hủy bỏ công việc ${jobId} thành công`);
        }
        return job;
    }
    // lấy tất cả và phân trang công việc
    async getAllJobs(limit = 10, page = 1) {
        const totalJobs = await JobModel.countDocuments();
        const totalPages = Math.ceil(totalJobs / limit);
        const jobs = await JobModel.find({})
            .limit(limit)
            .skip((page - 1) * limit);
        return {
            jobs,
            totalJobs,
            totalPages,
            currentPage: page
        }
    }
}

module.exports = NotificationService;
