const nodemailer = require("nodemailer");
require("dotenv").config()

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.transporter_email,
        pass: process.env.transporter_password
    }
});

module.exports = transporter