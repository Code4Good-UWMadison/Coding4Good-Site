var express = require('express');
var router = express.Router();
var db = require("../../server/proposal_db");

router.get('/create', function (req, res, next) {
    res.render('proposal/create', {});
});


module.exports = router;
