var express = require('express');
var db = require('../../server/proposal_db');
var router = express.Router();

router.post('/createProposal', function (req, res, next) {
    db.createProposal(req.body, function (err) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Failed to create'});
            return;
        }
        res.json({});
    });
});

module.exports = router;