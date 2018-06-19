var express = require('express');
var db = require('../server/db');
var router = express.Router();

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
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        req.session.uid = uid;
        res.json({});
    });
});

router.post('/login', function (req, res, next) {
    db.verifyUser(req.body, function (err, uid) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        if (uid) {
            req.session.uid = uid;
            res.json(true);
        }
        else {
            res.json(false);
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

router.post('/proposal/createProposal', function (req, res, next) {
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
