const express = require('express');
const user_db = require('../../server/user_db');
const project_db = require('../../server/project_db');
const router = express.Router();
const jwt = require('jsonwebtoken');

const baseUrl = "www.coding4good.net";

const emailService = require('../services/email_service');
const authService = require('../services/authorization_service');

router.get('/account_check', function (req, res, next) {
    if (req.session.uid != null) {
        user_db.getUserInfo(req.session.uid, function (err, user) {
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
    user_db.createUser(req.body, function (err, uid) {
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
                    user_db.removeUser(uid, function (err) {
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
    user_db.verifyUser(req.body, function (err, uid) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if (uid) {
            user_db.checkEmailVerificationByUid(uid, function(err, verified){
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
    user_db.updateProfile(req.session.uid, req.body, function (err) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        res.json({});
    });
});

router.post('/admin/get_profile', function (req, res, next) {
    let roles = [authService.UserRole.Admin,
                authService.UserRole.ProjectManager,
                authService.UserRole.Developer];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        if(!authorized){
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }
        user_db.getProfile(req.body.pid, function (err, profile) {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
                return;
            }
            res.json(profile);
        });
    });
});

router.post('/get_user_info', function (req, res, next) {
    let roles = [authService.UserRole.Admin];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        if(!authorized){
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }
        user_db.getUserById(req.body.user_id, function (err, user) {
            if(err) {
                console.log(err);
            }
            user_db.getProfileByUserId(user.id, function (err, profile) {
                if(err) {
                    console.log(err);
                }
                user_db.getUserRoleByUid(user.id, function (err, roles) {
                    if(err) {
                        console.log(err);
                    }
                    project_db.getAssociatedProjectsByUserId(user.id, function (err, projects) {
                        if(err) {
                            console.log(err);
                        }
                        res.json({user: user, profile: profile, roles: roles, projects: projects});
                    });
                });
            });
        });
    });
});

router.post('/update_user', function (req, res, next) {
    let roles = [authService.UserRole.Admin];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        if(!authorized) {
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }
        user_db.setUserRoleByUid(req.body.user_id, req.body.roles, function(err){
            if(err) {
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
            }
            else{
                res.json({});
            }
        })
    });
});

module.exports = router;
