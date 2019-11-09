var express = require('express');
var db = require('../../server/index_db');
var router = express.Router();
const nodemailer = require('nodemailer');

// delete before push
// get = get html from the webpage
// post is like user posting things (input with keyboard)

//steps
// 1 send email after sign up                                                                           done
// 2 after the user click the  URL in the email, send a post // maybe a get? 
// 3 the post should update the email_verified field inside the "users" table for that user.  
// 4 take them to a page notifying them that they're verified

router.get('/account_check', function (req, res, next) {
    if (req.session.uid != null) {
        db.getUserInfo(req.session.uid, function (err, user) {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
                return;
            }
            res.json(user);
        });
    }
    else {
        res.json({id: -1});
    }
});

router.post('/signup', function (req, res, next) {
    db.createUser(req.body, function (err, uid) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }

        req.session.uid = uid;
        let transporter = nodemailer.createTransport({
            host: 'smtp.office365.com', // ?
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: authorEmail, // generated ethereal user                 //use cliu547@wisc.edu to make sure it work first
                pass: authorPass // generated ethereal password
            }
        });
    //log res.body to debug
        // send mail with defined transport object
        let info = transporter.sendMail({
            from: 'cliu547@wisc.edu', //'"cfg web" <no-reply@cfg-web.org>', // sender address
            to: req.body.email, // list of receivers 
            subject: 'Verification email from Coding4Good', // Subject line
            text: 'Hello world?', // plain text body
            html: '<b>Hello world?</b>' // html body
        });
    
        console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...


                
        res.json({});

    });
});

router.post('/login', function (req, res, next) {
    db.verifyUser(req.body, function (err, uid) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        if (uid) {
            req.session.uid = uid;
            res.json(true);
        }
        else {
            res.json(false);
        }
    });
});

router.post('/upload_profile', function (req, res, next) {
    if (req.session.uid == null) {
        res.status(400).json({msg: 'Please login first'});
        return;
    }
    db.updateProfile(req.session.uid, req.body, function (err) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        res.json({});
    });
});

router.post('/admin/get_profile', function (req, res, next) {
    if (req.session.uid != 1) {
        res.status(400).json({msg: 'Not Authorized'});
        return;
    }
    db.getProfile(req.body.pid, function (err, profile) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        res.json(profile);
    });
});


module.exports = router;
