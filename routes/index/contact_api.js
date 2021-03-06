const express = require('express');
const router = express.Router();
const emailService = require('../services/email_service');

router.post('/contactEmail', function (req, res, next) {
    var data = req.body;
    data.userid = req.session.uid;
    var emailDetail = {
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
    emailService.sendEmail(emailDetail, function(err) {
        if (err) {
            console.log(err);
            res.json({status: false, msg: 'Failed to send Email, please try again later, or email us to <cfg.madison@gmail.com> if you are having trouble.'});
        } else {
            res.json({status: true});
        }
    });
});

module.exports = router;