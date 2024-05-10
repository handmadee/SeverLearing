const { OK, Created } = require('../core/success.response');
const userService = require('./../services/auth/user.service');


exports.register = async (req, res, next) => {
    return new Created(
        {
            message: 'Register success',
            data: await userService.register(req.body)
        }
    ).send(res);
};

exports.login = async (req, res, next) => {
    return new OK({
        message: 'Login success',
        data: await userService.login(req.body)
    }).send(res);
};

exports.refreshToken = async (req, res, next) => {
    return new OK({
        message: 'Token refreshed successfully',
        data: await userService.refreshToken(req.body.refreshToken)
    }).send(res)
};

exports.logout = async (req, res, next) => {
    return new OK({
        message: 'Logout successfully',
        data: await userService.logout(req.body.refreshToken)
    }).send(res);
};

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

exports.getUser = async (req, res) => {
    const id = req.params.id;
    return new OK({
        message: 'Get user successfully',
        data: await userService.getUser(id)
    }).send(res);
}

exports.changePassword = async (req, res) => {
    return new OK({
        message: 'Change password successfully',
        data: await userService.changePassword(req.body)
    }).send(res);
}

exports.findUserByUsername = async (req, res) => {
    return new OK({
        message: 'User found successfully',
        data: await userService.findUserByUsername(req.params.username)
    }).send(res);
}

exports.changePasswordByUsername = async (req, res) => {
    return new OK({
        message: 'Change password successfully',
        data: await userService.changePasswordByUsername(req.body)
    }).send(res);
}
// Delete Account
exports.deleteAccount = async (req, res) => {
    return new OK({
        message: 'Delete account successfully',
        data: await userService.deleteAccount(req.params.id)
    }).send(res);
}