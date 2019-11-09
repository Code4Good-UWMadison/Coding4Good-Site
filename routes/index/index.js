var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const EMAIL_SECRET = 'asdf1093KMnzxcvnkljvasdu09123nlasdasdf';
const db = require('../../server/index_db');

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
    if (req.session.uid == null) {
        res.redirect('/login');
        return;
    }
  res.render('user/profile');
});

router.get('/upload-complete', function (req, res) {
    if (req.session.uid === null) {
        res.redirect('/login');
        return;
    }
    res.render('user/upload-complete');
});

router.get('/login', function (req, res, next) {
    res.render('user/login', {});
});

router.get('/signup', function (req, res, next) {
    res.render('user/signup', {});
});

router.get('/logout', function (req, res, next) {
    req.session.uid = null;
    res.redirect('/');
});

router.get('/admin', function (req, res) {
    if (req.session.uid !== 1) {
        res.redirect('/');
    }
    res.render('admin');
});

router.get('/email-confirmation', function (req, res) {
    console.log(req.params.status);
    res.render('user/email-confirmation', {status: req.params.status});
});

router.get('/confirmation/:token', function (req, res){
    jwt.verify(req.params.token, EMAIL_SECRET, function(err, decoded) {
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
                            res.redirect('/email-confirmation?status=success');
                        }
                    });
                }
            })
        }
    });
});

module.exports = router;
