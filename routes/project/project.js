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
        user_db.getUserRoleByUid(req.session.uid, function (err, user_role) {
            if (err) {
                res.status(400).json({msg: 'Database Error'});
                return;
            }
           
            res.render('project/index', {
                projectSet: projectSet,
                isMy: false,
                uid: req.session.uid,
                all_user_role: authService.UserRole,
                user_role: user_role
            });

        });
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
        else if(!project){
            res.status(404).json({msg: "Not found"});
        }
        else{
            project_db.getAssociatedUsersByProjectId(project.id, function (err, members) {
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: 'Database Error'});
                    return;
                }
                else{
                    project_db.checkApplied(project.id, req.session.uid, function (err, hasApplied) {
                        if (err) {
                            res.status(400).json({msg: 'Database Error'});
                            return;
                        }
                        user_db.getUserRoleByUid(req.session.uid, function (err, user_role) {
                            if (err) {
                                res.status(400).json({msg: 'Database Error'});
                                return;
                            }
                            res.render('project/detail', {
                                projectDetail: project,
                                members: members,
                                uid: req.session.uid,
                                hasApplied: hasApplied,
                                role_list: authService.UserRole,
                                user_role: user_role,
                            });
                        });
                    });
                }
            });
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
            if(projectId){
                res.redirect('../project/detail?id='+projectId);
            }
            else{
                res.redirect('../project');    
            }
            return;
        }
        user_db.getAllUser(function (err, allUser) {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
                return;
            }
            else if(projectId){
                project_db.getProjectById(projectId, function (err, project) {
                    if (err) {
                        console.log(err);
                        res.status(400).json({msg: 'Database Error'});
                        return;
                    }
                    else if(!project){
                        res.status(404).json({msg: "Not found"});
                    }
                    project_db.getAssociatedUsersByProjectId(project.id, function (err, members) {
                        if (err) {
                            console.log(err);
                            res.status(400).json({msg: 'Database Error'});
                            return;
                        }
                        else{
                            res.render('project/edit', {projectDetail: project, members: members, allUser: allUser, role_list: authService.UserRole});
                        }
                    });
                });
            }
            else{
                res.render('project/edit', {projectDetail: {}, members: [], allUser: allUser, role_list: authService.UserRole});
            }
        });
    });
});

router.get('/applicants', function (req, res, next) {
    if (req.session.uid == null) {
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
            res.redirect('../project/detail?id=' + req.query.project_id);
            return;
        }
        project_db.getAllApplicantByProjectId(req.query.project_id, function(err, users) {
            if (err){
                console.log(err);
                res.status(400).json({msg: 'Database error'});
                return;
            } else {
                res.render('project/applicants', {users: users, project_id: req.query.project_id});
            }
        });
    });
});

module.exports = router;
