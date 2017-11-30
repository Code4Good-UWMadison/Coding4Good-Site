var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.get('/proposal', function(req, res){
  res.render('proposal');
});

module.exports = router;
