
const notFoundHandler = (req, res) => {
    res.status(404).render('errors/404', {
        title: '404 Not Found',
        message: 'Trang bạn yêu cầu không tồn tại'
    });
};

module.exports = notFoundHandler;