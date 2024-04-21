const User = require('./../../models/account.model');
const Token = require('./../../models/token.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

exports.register = async (userData) => {
    console.log(userData)
    const accout = await User.findOne({ username: userData.username });
    console.log(accout)
    if (accout) throw new Error('Username already exists');
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
    const user = await User.findOne({ username }).select('password');
    if (!user || !await bcrypt.compare(password, user.password)) {
        throw new Error('Invalid usernamemobmo or password');
    }
    const { accessToken, refreshToken } = generateTokens(user);
    const token = new Token({ user_id: user._id, access_token: accessToken, refresh_token: refreshToken });
    await token.save();
    return { user_id: user._id, accessToken, refreshToken };
};

exports.verifyToken = async (token) => {
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(payload.userId);
        if (!user) {
            throw new Error('User not found');
        }
        return { isValid: true, userId: payload.userId, role: payload.role };
    } catch (error) {
        return { isValid: false };
    }
};

exports.refreshToken = async (refreshToken) => {
    const token = await Token.findOne({ refresh_token: refreshToken });

    if (!token) {
        throw new Error('Invalid refresh token');
    }
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) {
        throw new Error('User not found');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    token.access_token = accessToken;
    token.refresh_token = newRefreshToken;
    await token.save();

    return { accessToken, refreshToken: newRefreshToken };
};

exports.logout = async (refreshToken) => {
    const token = await Token.findOneAndDelete({ refresh_token: refreshToken });
    if (!token) {
        throw new Error('Invalid refresh token');
    }
};

exports.getUser = async (userId) => {
    const user = await User.findById(userId).populate('info').select('info  ');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}