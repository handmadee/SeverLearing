
const jwt = require('jsonwebtoken');
const authen = require('./../services/auth/user.service');

module.exports = (roles) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies['accessToken'];
            console.log({
                access2: token
            });
            if (!token) {
                return res.status(403).redirect('/admin/403');
            }
            const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (!roles.includes(payload.role)) {
                return res.status(403).redirect('/admin/403');
            }
            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
                console.log("Refresh 2");
                const oldRefreshToken = req.cookies['refreshToken'];
                console.log(oldRefreshToken);
                if (!oldRefreshToken) {
                    return res.status(403).redirect('/admin/403');
                }
                try {
                    const genarateToken = await authen.refreshToken(oldRefreshToken);
                    if (!genarateToken) {
                        return res.status(403).redirect('/admin/403');
                    }
                    const { accessToken, refreshToken } = genarateToken;
                    console.log({
                        access2f: accessToken,
                        refresh2f: refreshToken
                    });

                    // Xóa các cookie cũ
                    res.clearCookie('accessToken', { path: '/' });
                    res.clearCookie('refreshToken', { path: '/' });

                    // Đặt cookie mới
                    res.cookie('accessToken', accessToken, {
                        path: '/',
                        // httpOnly: true,
                        // secure: true,
                        // sameSite: 'Strict'
                    });
                    res.cookie('refreshToken', refreshToken, {
                        path: '/',
                        // httpOnly: true,
                        // secure: true,
                        // sameSite: 'Strict'
                    });
                    // Gửi lại request gốc sau khi refresh token thành công
                    return res.redirect(req.originalUrl);
                } catch (error) {
                    console.log({
                        errorToken: error
                    });
                    return res.status(403).redirect('/admin/auth');
                }
            } else {
                next(error);
            }
        }
    };
};
