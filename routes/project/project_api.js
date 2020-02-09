const express = require('express');
const project_db = require('../../server/project_db');
const router = express.Router();
const user_db = require('../../server/user_db');
const authService = require('../services/authorization_service');

router.post('/createProject', function (req, res, next) {
    let roles = [authService.UserRole.Admin,
                authService.UserRole.ProjectManager,
                authService.UserRole.Developer];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }
        project_db.createProject(req.body, function (err) {
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
    let roles = [authService.UserRole.Developer, 
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
        project_db.editProject(req.body, function (err) {
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
    let roles = [authService.UserRole.Developer, 
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
        project_db.removeProjectById(req.body.pid,function (err) {
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
        user_db.getProfileByUserId(req.session.uid, function(err, hasProfile){
            if (err){
                res.status(400).json({msg: "Database Error"});
            }else{
                if (hasProfile){
                    project_db.applyProject(req.body.project_id, req.session.uid, function(err){    
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
