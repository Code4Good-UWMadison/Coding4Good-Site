const express = require('express');
const router = express.Router();
const project_db = require("../../server/project_db");
const user_db = require("../../server/user_db");

const authService = require('../services/authorization_service');

router.get('/', function (req, res, next) {
    project_db.getProjectSet(function (err, projectSet) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        res.render('project/index', {projectSet: projectSet, isMy: false, uid: req.session.uid});
    });
});

router.get('/my', function (req, res, next) {
    authService.authorizationCheck(null, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.redirect('../login');
            return;
        }
        else{
            project_db.getAssociatedProjectsByUserId(req.session.uid, function (err, projectSet) {
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: 'Database Error'});
                    return;
                }
                res.render('project/index', {projectSet: projectSet, isMy: true, uid: null});
            });
        }
    });
});

router.get('/detail', function (req, res, next) {
    project_db.getProjectById(req.query.id, function (err, project) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        project_db.getAssociatedUsersByProjectId(project.id, function (err, users) {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
                return;
            }

            project_db.getUserAppliedProjectByUserId(req.session.uid, function (err, applied_project_id) {
                if (err) {
                    res.status(400).json({msg: 'Database Error'});
                    return;
                }
                var hasApplied = false;
                for (var i = 0; i < applied_project_id.length; i++) {
                    var project_id = applied_project_id[i].project_id;
                    if (project_id == project.id) {
                        hasApplied = true;
                        break;
                    }
                }
                res.render('project/detail', {projectDetail: project, users: users, uid: req.session.uid, hasApplied: hasApplied});
            })
        })
    });
});

router.get('/create', function (req, res, next) {
    if (req.session.uid === null) {
        res.redirect('../login');
        return;
    }
    let roles = [authService.UserRole.Developer,
                authService.UserRole.Admin,
                authService.UserRole.ProjectManager];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.redirect('../');
            return;
        }
        else{
            user_db.getAllUser(function (err, allUser) {
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: 'Database Error'});
                    return;
                }
                res.render('project/create', {allUser: allUser});
            })
        }
    });
});

router.get('/edit', function (req, res, next) {
    const projectId = req.query.id;
    if (req.session.uid === null) {
        res.redirect('../login');
        return;
    }
    let roles = [authService.UserRole.Admin,
                authService.UserRole.Developer,
                authService.UserRole.ProjectManager,
                authService.UserRole.ProjectLeader];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.redirect('../project/detail?id='+projectId);
            return;
        }
        project_db.getProjectById(projectId, function (err, project) {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
                return;
            }
            project_db.getAssociatedUsersByProjectId(project.id, function (err, users) {
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: 'Database Error'});
                    return;
                }
                user_db.getAllUser(function (err, allUser) {
                    if (err) {
                        console.log(err);
                        res.status(400).json({msg: 'Database Error'});
                        return;
                    }
                    res.render('project/edit', {projectDetail: project, users: users, allUser: allUser});
                });
            });
        });
    });
});

router.get('/applicants', function (req, res, next) {
    let roles = [authService.UserRole.Admin,
                authService.UserRole.Developer,
                authService.UserRole.ProjectManager,
                authService.UserRole.ProjectLeader];
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.redirect('../project/detail?id=' + projectId);
            return;
        }
        project_db.getAllApplicantByProjectId(req.query.project_id, function(err, users) {
            if (err){
                console.log(err);
                res.status(400).json({msg: 'Database error'});
                return;
            } else {
                res.render('project/applicants', {users: users});
            }
        });
    });
});

router.get('/profile', function (req, res) {

    const user_id = req.query.user_id;

    // authService.authorizationCheck(null, req.session.uid, function(err, authorized){
    //     if (err) {
    //         res.status(400).json({msg: 'Database Error'});
    //         return;
    //     }
    //     else if(!authorized){
    //         res.redirect('/login');
    //         return;
    //     }
        user_db.getProfileByUserId(user_id, function (err, profile) {
            if(err){
                res.status(400).json({msg: err});
                return;
            }
            else{
                if(!profile){
                    profile = {};
                }
                res.render('user/profile', {profile: profile, others: true});
            }
        });
    // });
});

module.exports = router;
