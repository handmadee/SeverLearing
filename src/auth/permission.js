const jwt = require('jsonwebtoken');
const authen = require('./../services/auth/user.service');


module.exports = (roles) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies['accessToken'];
            console.log(token)
            if (!token) {
                return res.status(403).redirect('/admin/403');
            }
            const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log(payload)
            if (!roles.includes(payload.role)) {
                return res.status(403).redirect('/admin/403');
            }
            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
                // Refesh token
                const oldRefreshToken = req.cookies['refreshToken'];
                if (!oldRefreshToken) {
                    return res.status(403).redirect('/admin/403');
                };
                try {
                    const genarateToken = await authen.refreshToken(oldRefreshToken);
                    if (!genarateToken) {
                        return res.status(403).redirect('/admin/403');
                    };
                    const { accessToken, refreshToken } = genarateToken;
                    res.cookie('accessToken', accessToken, { path: '/' });
                    res.cookie('refreshToken', refreshToken, { path: '/' });
                } catch (error) {
                    return res.status(403).redirect('/admin/auth');
                }
            } else {
                next(error);
            }
        }
    };
};