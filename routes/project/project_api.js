const express = require('express');
const project_db = require('../../server/project_db');
const router = express.Router();
const user_db = require('../../server/user_db');

const baseUrl = "www.coding4good.net";

const emailService = require('../services/email_service');
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
    authService.authorizationCheck(null, req.session.uid, function(err, authorized){
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
                    res.json({msg: "Please complete your Profile before applying for a project."});
                }
            }
        });
    });
});

router.post('/approveApplicant', function(req, res, next){
    let roles = [authService.UserRole.Developer, 
                authService.UserRole.Admin,
                authService.UserRole.ProjectManager];
    authService.authorizationCheck(null, req.session.uid, function(err, authorized){
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }
        else{
            project_db.approveApplicant(req.body.project_id, req.body.user.id, function(err){
                if (err){
                    console.log(err);
                    res.status(400).json({msg: "Database error"});
                }else{
                    project_db.getProjectById(req.body.project_id, function(err){
                        if(err){
                            console.log(err);
                            res.status(400).json({msg: "Database error"});
                        }
                        else{
                            const url = `https://${baseUrl}/project/detail?id=${req.body.project_id}`;
                            const emailDetail = {
                                to: req.body.user.email,
                                subject: "Project application result from Coding4Good",
                                html: `Congradulations! You application to team ${req.body.project.title} have been accepted! &nbsp;</br>
                                        Please follow the link to checkout your Project Manager, Project Leader, and Other Members &nbsp;</br>
                                        <a href='${url}'>${url}</a>`
                            };
                            emailService.sendEmail(emailDetail, function(err){
                                if(err){
                                    console.log(err);
                                    res.status(400).json({msg: 'Database Error'});
                                }else{
                                    res.json({msg: 'Failed to send Email, please try again later, or contact us if you are having trouble.'});
                                }
                            });
                        }
                    })
                }            
            });
        }
    });
});

router.post('/rejectApplicant', function(req, res, next){
    authService.authorizationCheck(null, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }
        else{
            project_db.rejectApplicant(req.body.project_id, req.body.user.id, function(err){
                if (err){
                    console.log(err);
                    res.status(400).json({msg: "Database error"});
                }else{
                    project_db.getProjectById(req.body.project_id, function(err){
                        if(err){
                            console.log(err);
                            res.status(400).json({msg: "Database error"});
                        }
                        else{
                            const url = `https://${baseUrl}/project/detail?id=${req.body.project.id}`;
                            const emailDetail = {
                                to: req.body.user.email,
                                subject: "Project application result from Coding4Good",
                                html: `Unfortunately, the team ${req.body.project.title} will not move on with your application. &nbsp;</br>
                                        Please follow the link to contact your Project Leader for any questions! &nbsp;</br>
                                        <a href='${url}'>${url}</a>`
                            };
                            emailService.sendEmail(emailDetail, function(err){
                                if(err){
                                    console.log(err);
                                    res.status(400).json({msg: 'Database Error'});
                                }else{
                                    res.json({msg: 'Failed to send Email, please try again later, or contact us if you are having trouble.'});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
