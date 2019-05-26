const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS
    }
});

router.post('/sendEmail', function (req, res, next) {
    var data = req.body;
    var mailOptions = {
        from: '"cfg web" <no-reply@cfg-web.org>',//from: 'no-reply@cfg-web.org',
        to: process.env.EMAILUSER,
        subject: 'Contact from the website',
        html: '<h4> Email: ' + data.email + '<br>'
        + 'Phone: ' + data.phone + '<br>'
        + 'Date: ' + data.date
        + '<p>Content: ' + data.content + '</p></h4>'
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(err);
            res.status(500).json({msg: 'Failed to send email'});
            return;
        } else {
            console.log('Message sent: ' + info.response);
            res.json({});
        }
    });
});

module.exports = router;