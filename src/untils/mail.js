'use strict'

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'datpxpd07286@fpt.edu.vn',
        pass: 'fvaq ykbp aaef iwzq'
    }
});

module.exports = transporter;