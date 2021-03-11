var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../../server/user_db');

const authService = require('../services/authorization_service');

router.get('/', function (req, res, next) {
    res.render('index', {});
});

router.get('/index', function (req, res, next) {
    res.render('index', {});
});

router.get('/about', function (req, res, next) {
    res.render('about', {});
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {});
});

router.get('/sponsor', function (req, res) {
    res.render('sponsor', {});
});

router.get('/profile', function (req, res) {
    var profile_uid = req.query.user_id ? req.query.user_id : req.session.uid;
    var project_id = req.query.project_id;
    authService.authorizationCheck(null, req.session.uid, function(err, authorized){
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
        }
        else if(!authorized){
            res.redirect('/login');
        }
        else{
            db.getProfileByUserId(profile_uid, function (err, profile) {
                if(err){
                    console.log(err);
                    res.status(400).json({msg: err});
                    return;
                }
                else{
                    if(!profile){
                        profile = {};
                    }
                    db.getUserById(profile_uid, function (err, user){
                        if(err){
                            console.log(err);
                            res.status(400).json({msg: err});
                        }
                        else{
                            res.render('user/profile', 
                            {
                                profile: profile, 
                                others: profile_uid != req.session.uid, 
                                fromApply: req.query.fromApply ? true : false, 
                                user: user, 
                                project_id: project_id});
                        }
                    })
                }
            });
        }
    });
});

// router.get('/upload-complete', function (req, res) {
//     authService.authorizationCheck(null, req.session.uid, function(err, authorized){
//         if (err) {
//             res.status(400).json({msg: 'Database Error'});
//             return;
//         }
//         else if(!authorized){
//             res.redirect('/login');
//             return;
//         }
//         else{
//             res.render('user/upload-complete');
//         }
//     });
// });

router.get('/login', function (req, res, next) {
    res.render('user/login', {});
});

router.get('/forget-password', function (req, res, next) {
    res.render('user/forget-password', {});
});

router.get('/reset-password/:token', function (req, res){
    jwt.verify(req.params.token, process.env.SECRET, function(err, decoded) {
        if(err){
            console.log(err);
            res.status(400).json({msg: err});
            return;
        }
        else{
            res.render('user/reset-password', {token:req.params.token});
        }
    });
});

router.get('/signup', function (req, res, next) {
    res.render('user/signup', {});
});

router.get('/logout', function (req, res, next) {
    req.session.uid = null;
    res.redirect('/');
});

router.get('/user-admin', function (req, res) {
    if (req.session.uid == null) {
        res.redirect('../login');
        return;
    }
    let roles = [authService.UserRole.Admin,
                authService.UserRole.Developer];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.redirect('/');
            return;
        }
        else{
            db.getAllUser(function (err, allUser) {
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: 'Database Error'});
                    return;
                }
                res.render('user/user-admin',{allUser: allUser, userRole: authService.UserRole});
            });
        }
    });
})

router.get('/email-confirmation', function (req, res) {
    res.render('user/email-confirmation');
});

router.get('/confirmation/:token', function (req, res){
    jwt.verify(req.params.token, process.env.SECRET, function(err, decoded) {
        if(err){
            res.status(400).json({msg: err});
            return;
        }
        else{
            var id = decoded.uid;
            var user = {
                "email": decoded.email,
                "password": decoded.password 
            };
            db.verifyUser(user, function(err, uid){
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: err});
                    return;
                }
                else if(!uid) {
                    res.status(400).json({msg: "Wrong token information, unauthorized!"});
                    return;
                }
                else {
                    db.verifyEmailByUserId(uid, function (err){
                        if (err) {
                            console.log(err);
                            res.status(400).json({msg: err});
                            return;
                        }
                        else{
                            req.session.uid = uid;
                            res.redirect('/?status=s');                           
                        }
                    });
                }
            })
        }
    });
});

router.get('/resend-email', function (req, res, next) {
    res.render('user/resend-email', {});
});

module.exports = router;
