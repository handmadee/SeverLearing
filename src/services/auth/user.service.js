const { BadRequestError, UnauthorizedError } = require('../../core/error.response');
const User = require('./../../models/account.model');
const TrackingQuiz = require('./../../models/trakingQuiz/TrakingQuiz');
const TrackingCourse = require('./../../models/traking /historyCourse.model');
const Token = require('./../../models/token.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fcmTokenModel = require('../../models/firebase/fcmToken.model');
const studentAttendance = require('../../models/shechedule/studentAttendance');


const generateTokens = (user) => {
    const accessToken = jwt.sign({ userId: user._id, role: user?.pemission }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: user._id, role: user?.pemission }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
    return { accessToken, refreshToken };
};

exports.register = async (userData) => {
    console.log(userData)
    const accout = await User.findOne({ username: userData.username });
    console.log(accout)
    if (accout) throw new BadRequestError('Username already exists');
    userData.password = await bcrypt.hash(userData.password, 10);
    const user = new User(userData);
    await user.save();
    const { accessToken, refreshToken } = generateTokens(user);
    const token = new Token({ user_id: user._id, access_token: accessToken, refresh_token: refreshToken });
    await token.save();
    return { user_id: user._id, accessToken, refreshToken };
};

exports.login = async (loginData) => {
    const { username, password } = loginData;
    const user = await User.findOne({ username }).select('password pemission');
    if (!user || !await bcrypt.compare(password, user.password)) {
        throw new BadRequestError('Invalid usernamemobmo or password');
    }
    const { accessToken, refreshToken } = generateTokens(user);
    const token = new Token({ user_id: user._id, role: user?.pemission, access_token: accessToken, refresh_token: refreshToken });
    await token.save();
    return { user_id: user._id, role: user?.pemission, accessToken, refreshToken };
};

exports.verifyToken = async (token) => {
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        //  Payload 
        console.log({
            access: payload
        });
        const user = await User.findById(payload.userId);
        if (!user) {
            throw new BadRequestError('User not found');
        }
        return { isValid: true, userId: payload.userId, role: payload?.role };
    } catch (error) {
        throw new UnauthorizedError('Invalid token');
    }
};

exports.refreshToken = async (refreshToken) => {
    console.log("Resfesh token")
    // const token = await Token.findOne({ refresh_token: refreshToken });
    // if (!token) {
    //     throw new BadRequestError('Invalid refresh token');
    // }
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log({
        rf: payload
    })

    const user = await User.findById(payload.userId);
    if (!user) {
        throw new BadRequestError('User not found');
    }
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    console.log({
        access: accessToken,
        refesh: newRefreshToken
    })

    // token.access_token = accessToken;
    // token.refresh_token = newRefreshToken;
    // await token.save();
    return { accessToken, refreshToken: newRefreshToken };
};


exports.logout = async (refreshToken) => {
    const token = await Token.findOneAndDelete({ refresh_token: refreshToken });
    if (!token) {
        throw new BadRequestError('Invalid refresh token');
    }
};

exports.getUser = async (userId) => {
    const user = await User.findById(userId).populate('info').select('info  pemission');
    if (!user) {
        throw new BadRequestError('User not found');
    }
    return user;
}

// Change Password
exports.changePassword = async (data) => {
    console.log(data)
    const { userId, oldPassword, newPassword } = data;
    const user = await User.findById(userId).select('password');
    if (!user || !await bcrypt.compare(oldPassword, user.password)) {
        throw new BadRequestError('Invalid password');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return true;
}

// find user by username
exports.findUserByUsername = async (username) => {
    const user = await User.findOne({ username }).select('username');
    if (!user) {
        throw new BadRequestError('User not found');
    }
    return user;
}

// change password by username
exports.changePasswordByUsername = async (data) => {
    const { username, newPassword } = data;
    const user = await User.findOne({ username }).select('password');
    if (!user) {
        throw new BadRequestError('User not found');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return user;
}

// Delete Account
exports.deleteAccount = async (_id) => {
    try {
        const deleteUser = User.findByIdAndDelete(_id);
        const deleteTrackingCourses = TrackingCourse.deleteMany({ userID: _id });
        const deleteTrackingQuizzes = TrackingQuiz.deleteMany({ userID: _id });
        const delNotificatino = fcmTokenModel.deleteMany({
            accountId: _id
        });
        // const deleteShechedule = studentAttendance.deleteMany({
        //     teacherAccount: _id
        // })
        // // delete luôn thằng lịch đã diểm danh 

        await Promise.all([deleteUser, deleteTrackingCourses, deleteTrackingQuizzes, delNotificatino]);

        console.log(`User with ID ${_id} and their tracking data have been deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting user data for ID ${_id}:`, error);
    }

}
// edit role
exports.editRole = async (id, pemission) => {
    const user = await User.findOneAndUpdate(
        { _id: id },
        { pemission },
        { new: true }
    );
    if (!user) {
        throw new BadRequestError('User not found');
    }
    return user;
}

