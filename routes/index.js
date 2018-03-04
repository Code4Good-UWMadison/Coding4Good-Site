var express = require('express');
var router = express.Router();
var db = require("./server/db");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {});
});

router.get('/about', function (req, res, next) {
  res.render('about', {});
});

router.get('/contact', function (req, res, next) {
  res.render('contact', {});
});

router.get('/project', function (req, res, next) {
  res.render('project', {});
});

router.get('/project/detail', function (req, res, next) {
  db.getProjectById(req.query.id, function (err, project) {
    if (err) {
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    res.render('projectDetail', {projectDetail: project});
  });
});

router.get('/project/new', function (req, res, next) {
  res.render('projectCreate', {});
});

router.get('/profile', function (req, res) {
  if (req.session.uid == null) {
    res.redirect('/login');
    return;
  }
  res.render('profile');
});

router.get('/admin', function (req, res) {
  if (req.session.uid != 1) {
    res.redirect('/');
    return;
  }
  res.render('admin');
});

router.get('/upload-complete', function (req, res) {
  if (req.session.uid == null) {
    res.redirect('/login');
    return;
  }
  res.render('upload-complete');
});


router.get('/login', function (req, res, next) {
  res.render('login', {});
});

router.get('/signup', function (req, res, next) {
  res.render('signup', {});
});

router.get('/logout', function (req, res, next) {
  req.session.uid = null;
  res.redirect('/');
});

router.get('/proposal', function (req, res) {
  res.render('proposal');
});

module.exports = router;
