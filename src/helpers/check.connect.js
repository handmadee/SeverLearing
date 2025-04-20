'use strict'

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');

/**
 * Hiển thị số lượng kết nối đến MongoDB hiện tại
 */
const checkConnect = () => {
    const numConnect = mongoose.connections.length;
    console.log(`Number of connections: ${numConnect}`);
}

/**
 * Giám sát và ngăn chặn quá tải kết nối đến MongoDB
 * Kiểm tra định kỳ số lượng kết nối và sử dụng bộ nhớ
 * Đóng ứng dụng nếu vượt quá ngưỡng an toàn
 * @returns {NodeJS.Timeout} ID của interval để có thể hủy nếu cần
 */
const _SECONDS = 5000; // Chu kỳ kiểm tra: 5 giây
const checkOverloadConnect = () => {
    return setInterval(() => {
        const numConnect = mongoose.connections.length;
        const numCpu = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        const maxConnect = numCpu * 5; // Cho phép tối đa 5 kết nối trên mỗi CPU

        console.log('Active connections: ', numConnect);
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

        if (numConnect > maxConnect) {
            console.log(`Overload connect: ${numConnect}`);
            process.exit(1);
        }
    }, _SECONDS);
}

module.exports = { checkConnect, checkOverloadConnect };