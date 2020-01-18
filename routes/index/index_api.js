const express = require('express');
const db = require('../../server/user_db');
const emailService = require('../services/email_service');
const router = express.Router();
const jwt = require('jsonwebtoken');
const baseUrl = "www.coding4good.net";

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
            const emailToken = jwt.sign({
                    "uid": uid,
                    "email": req.body.email,
                    "password": req.body.password
                },
                process.env.SECRET,
                {
                    expiresIn: '1d',
                }
            )
            const url = `http://${baseUrl}/confirmation/${emailToken}`;
            
            var emailDetail = {
                to: req.body.email, // list of receivers 
                subject: "Verification email from Coding4Good",
                html: `Hello from the Coding for Good team!</br></br>Thank you for registering!</br>Please click this link to confirm your email ` +
                `address: <a href='${url}'>${url}</a></br><img style="width:220px;" src="cid:club-icon" alt="Corgi"></br>Please do not reply to this email.`,
                attachments: [{
                    filename: 'icon.jpg',
                    path: '/app/public/img/icon.jpg',
                    cid: 'club-icon'
                }]
            };
            emailService.sendEmail(emailDetail, function(err){
                if(!err){
                    res.json({status: true});
                    return;
                }
                else {
                    db.removeUser(uid, function (err) {
                        if(err){
                            console.log(err);
                            res.status(400).json({msg: 'Database Error'});
                            return;
                        }
                        else {
                            res.json({status: false, msg: 'Failed to send Email, please try again later, or contact us if you are having trouble.'});
                        }
                    });
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
