const jwt = require('jsonwebtoken');
const { FORBIDDEN } = require('../core/reasonPhrases');

module.exports = (roles) => {
    return (req, res, next) => {
        const token = req.headers.authorization.split(' ')[1];
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!roles.includes(payload.role)) {
            throw new FORBIDDEN('You do not have permission to access this resource');
        }
        next();
    };
};