var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.get('/about', function(req, res, next) {
  res.render('about', {});
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {});
});

router.get('/login', function(req, res, next) {
  res.render('login', {});
});

router.get('/signup', function(req, res, next) {
  res.render('signup', {});
});

router.get('/proposal', function(req, res){
  res.render('proposal');
});

module.exports = router;
