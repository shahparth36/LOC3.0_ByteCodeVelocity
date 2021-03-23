require("dotenv/config");
const nodemailer = require('nodemailer');

function sendEmail(email,subjectOfEmail, textToBeSentInEmail) {
    var transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.email,
            pass: process.env.password,
        },
    });

    transporter.sendMail({
        from: process.env.email,
        to: email,
        subject: subjectOfEmail,
        text: textToBeSentInEmail
    }, (err, info) => {
        if (err)
            console.log(err);
        console.log(info);
    });

    transporter.close();
}

module.exports = {
    sendEmail
}