var express = require('express');
var db = require('../../server/index_db');
var router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const baseUrl = "www.coding4good.net";
const HOST = "smtp-mail.outlook.com";

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
            if(err.code == 23505){
                res.json({status: false, msg: 'This email account has been registered already, please login or use another email!'});
            }
            else{
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
            }
            return;
        }
        else {
            let transporter = nodemailer.createTransport({
                host: HOST,
                secureConnection: false,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAILUSER,
                    pass: process.env.EMAILPASS
                }
            });
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
            transporter.sendMail({
                from: `"Coding for Good Team <"${process.env.EMAILUSER}">" `,
                to: req.body.email, // list of receivers 
                subject: "Verification email from Coding4Good",
                html: `Hello from the Coding for Good team!</br></br>Thank you for registering!</br>Please click this link to confirm your email ` +
                `address: <a href='${url}'>${url}</a></br><img style="width:25px;" src="cid:club-icon" alt="Corgi"></br>Please do not reply to this email.`,
                attachments: [{
                    filename: 'icon-no-bg.jpg',
                    path: '/app/public/img/icon-no-bg.jpg',
                    cid: 'club-icon'
                }]
            }, function (err, info) {
                if(err){
                    console.log(err);
                    db.removeUser(uid, function (err) {
                        if(err){
                            console.log(err);
                            res.status(400).json({msg: 'Database Error'});
                            return;
                        }
                        else {
                            res.json({status: false, msg: 'Failed to send Email, please try again later, and contact us if you are having trouble.'});
                        }
                    });
                }
                else{
                    //console.log(info);
                    res.json({status: true});
                }
            });
        }
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
                else if (verified === false){
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
