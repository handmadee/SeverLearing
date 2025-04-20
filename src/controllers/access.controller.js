const { OK, Created } = require('../core/success.response');
const { accountSupper } = require('../services/account/account.service');
const userService = require('./../services/auth/user.service');

/**
 * AUTHENTICATION CONTROLLERS
 */

/**
 * Đăng ký tài khoản mới
 */
exports.register = async (req, res, next) => {
    return new Created({
        message: 'Register success',
        data: await userService.register(req.body)
    }).send(res);
};

/**
 * Đăng nhập vào hệ thống
 */
exports.login = async (req, res, next) => {
    return new OK({
        message: 'Login success',
        data: await userService.login(req.body)
    }).send(res);
};

/**
 * Làm mới token xác thực
 */
exports.refreshToken = async (req, res, next) => {
    return new OK({
        message: 'Token refreshed successfully',
        data: await userService.refreshToken(req.body.refreshToken)
    }).send(res)
};

/**
 * Đăng xuất khỏi hệ thống
 */
exports.logout = async (req, res, next) => {
    return new OK({
        message: 'Logout successfully',
        data: await userService.logout(req.body.refreshToken)
    }).send(res);
};

/**
 * Kiểm tra tính hợp lệ của token
 */
exports.verifyToken = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: token });
    }
    return new OK({
        message: 'Token is valid',
        data: await userService.verifyToken(token)
    }).send(res);
}

/**
 * USER MANAGEMENT CONTROLLERS
 */

/**
 * Lấy thông tin người dùng theo ID
 */
exports.getUser = async (req, res) => {
    const id = req.params.id;
    return new OK({
        message: 'Get user successfully',
        data: await userService.getUser(id)
    }).send(res);
}

/**
 * Đổi mật khẩu người dùng
 */
exports.changePassword = async (req, res) => {
    return new OK({
        message: 'Change password successfully',
        data: await userService.changePassword(req.body)
    }).send(res);
}

/**
 * Tìm người dùng theo tên đăng nhập
 */
exports.findUserByUsername = async (req, res) => {
    return new OK({
        message: 'User found successfully',
        data: await userService.findUserByUsername(req.params.username)
    }).send(res);
}

/**
 * Đổi mật khẩu theo tên đăng nhập
 */
exports.changePasswordByUsername = async (req, res) => {
    return new OK({
        message: 'Change password successfully',
        data: await userService.changePasswordByUsername(req.body)
    }).send(res);
}

/**
 * Xóa tài khoản
 */
exports.deleteAccount = async (req, res) => {
    return new OK({
        message: 'Delete account successfully',
        data: await userService.deleteAccount(req.params.id)
    }).send(res);
}

/**
 * PERMISSION CONTROLLERS
 */

/**
 * Chỉnh sửa quyền người dùng
 */
exports.editRole = async (req, res) => {
    const id = req.params.id;
    const pemission = req.body.pemission;
    return new OK({
        message: 'Edit role successfully',
        data: await userService.editRole(id, pemission)
    }).send(res);
}

/**
 * Khởi tạo tài khoản quản trị viên
 */
exports.accountSupper = async (req, res) => {
    return new OK({
        message: 'Create super admin account successfully',
        data: await accountSupper()
    }).send(res);
}

