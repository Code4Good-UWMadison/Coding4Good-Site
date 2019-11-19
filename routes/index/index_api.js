var express = require('express');
var db = require('../../server/index_db');
var router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const baseUrl = "www.coding4good.net";
const HOST = "smtp.office365.com";

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
        else {
            let transporter = nodemailer.createTransport({
                host: HOST,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                user: process.env.EMAILUSER,
                pass: process.env.EMAILPASS
                }
            });
            try {
                const emailToken = jwt.sign({
                        "uid": uid,
                        "email": req.body.email,
                        "password": req.body.password
                    },
                    process.env.EMAIL_SECRET,
                    {
                        expiresIn: '1d',
                    },
                )
                const url = `http://${baseUrl}/confirmation/${emailToken}`;  
                let info = transporter.sendMail({
                    from: `"Coding for Good Team <"${process.env.EMAILUSER}">" `,
                    to: req.body.email, // list of receivers 
                    subject: "Verification email from Coding4Good",
                    html: `Hello from the Coding for Good team!</br></br>Thank you for registering!</br>Please click this link to confirm your email ` +
                    `address: <a href='${url}'>${url}</a></br></br>Please do not reply to this email.`,
                });
            } catch (err) {
                console.log(err);
                res.status(500).json({msg: 'Failed to send Email'});
                return;
            }   
        }
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
        else if (uid) {
            db.checkEmailVerificationByUid(uid, function(err, verified){
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: 'Database Error'});
                    return;
                }
                else if (verified === null){
                    res.json({status: false, msg: "The user is not found."});
                    return;
                }
                else if (!verified){
                    res.json({status: false, msg: "Please verify your email before login."});
                    return;
                }
                else {
                    req.session.uid = uid;
                    res.json({status: true, msg: ""});
                }
            });
        }
        else {
            res.json({status: false, msg: "Your username or password is wrong, please try again!"});
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
