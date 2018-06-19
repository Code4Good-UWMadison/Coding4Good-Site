var express = require('express');
var db = require('../server/projectdb');
var router = express.Router();

router.post('/project/createProject', function (req, res, next) {
    if (req.session.uid != 1) {
        res.status(400).json({msg: 'Not Authorized'});
        return;
    }
    db.createProject(req.body, function (err) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Failed to create'});
            return;
        }
        res.json({});
    });
});

router.post('/project/saveProject', function (req, res, next) {
    if (req.session.uid != 1) {
        res.status(400).json({msg: 'Not Authorized'});
        return;
    }
    db.editProject(req.body, function (err) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Failed to save'});
            return;
        }
        res.json({});
    });
});

router.post('/project/removeProject', function(req, res, next){
    if(req.session.uid!=1){
        res.status(400).json({msg: 'Not Authorized'});
        return;
    }
    db.removeProjectById(req.body.id,function (err) {
        if(err){
            console.log(err);
            res.status(400).json({msg: 'Failed to remove'});
            return;
        }
        res.json({});
    });
});