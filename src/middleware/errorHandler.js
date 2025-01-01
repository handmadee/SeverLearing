const errorHandlerV = (err, req, res, next) => {
    console.error(err.stack);

    if (err.status === 404) {
        return res.status(404).render('error/404', {
            title: '404 Not Found',
            message: 'Trang bạn yêu cầu không tồn tại'
        });
    }

    res.status(500).render('error/500', {
        title: '500 Internal Server Error',
        message: 'Đã xảy ra lỗi, vui lòng thử lại sau'
    });
};

module.exports = errorHandlerV;