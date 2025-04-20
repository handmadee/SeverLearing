/**
 * Bọc các hàm xử lý async để bắt lỗi tự động
 * Giúp tránh việc phải sử dụng try/catch lặp đi lặp lại trong các controller
 * @param {Function} fn Hàm controller cần xử lý async
 * @returns {Function} Middleware Express đã được bọc
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = { asyncHandler };  