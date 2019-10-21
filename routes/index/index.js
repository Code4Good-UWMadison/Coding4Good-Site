var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', {});
});

router.get('/index', function (req, res, next) {
    res.render('index', {});
});

router.get('/sponsor', function (req, res) {
    res.render('sponsor', {});
});

router.get('/about', function (req, res, next) {
    res.render('about', {});
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {});
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
    return;
  }
  res.render('admin');
});

module.exports = router;
