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
    data.userid = req.session.uid;
    var mailOptions = {
        from: '"cfg web" <no-reply@cfg-web.org>',//from: 'no-reply@cfg-web.org',
        to: process.env.EMAILUSER,
        subject: 'Contact from the website',
        html: '<h4> Name: ' + data.name + '<br>'
        + 'Organization: ' + data.organization + '<br>'
        + 'Email: ' + data.email + '<br>'
        + 'Phone: ' + data.phone + '<br>'
        + 'Date: ' + data.date + '<br>'
        + 'UserId: ' + data.userid
        + '<p>Content: ' + data.content + '</p></h4>',
        text: data
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            res.status(500).json({msg: 'Failed to send email'});
            return;
        } else {
            console.log('Message sent: ' + info.response);
            res.json({});
        }
    });
});

module.exports = router;