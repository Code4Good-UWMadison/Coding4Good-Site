var express = require('express');
var db = require('../../server/project_db');
var router = express.Router();

const authService = require('../services/authorization_service');

router.post('/createProject', function (req, res, next) {
    let roles = [authService.UserRole.Root, 
        authService.UserRole.Admin,
        authService.UserRole.ProjectManager];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
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
});

router.post('/saveProject', function (req, res, next) {
    let roles = [authService.UserRole.Root, 
        authService.UserRole.Admin,
        authService.UserRole.ProjectManager,
        authService.UserRole.ProjectLeader];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
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
});

router.post('/removeProject', function(req, res, next){
    let roles = [authService.UserRole.Root, 
        authService.UserRole.Admin,
        authService.UserRole.ProjectManager];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
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
});

router.post('/applyProject', function(req, res, next){
    let roles = null;
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }
        db.getProfileByUserId(req.session.uid, function(err, hasProfile){
            if (err){
                res.status(400).json({msg: "Database Error"});
            }else{
                if (hasProfile){
                    db.applyProject(req.body.project_id, req.session.uid, function(err){
                        if(err){
                            console.log(err);
                            res.status(400).json({msg: 'Failed to apply'});
                            return;
                        }
                        res.json({});
                    });
                }
                else{
                    res.json({msg: "Please finish your Profile before applying for a project."});
                }
            }
        });
    });
});
module.exports = router;
