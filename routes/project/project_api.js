const express = require('express');
const project_db = require('../../server/project_db');
const router = express.Router();
const user_db = require('../../server/user_db');

const baseUrl = "www.coding4good.net";

const emailService = require('../services/email_service');
const authService = require('../services/authorization_service');

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
            res.status(403).json({msg: 'Not Authorized'});
            return;
        }
        if(req.body.id){
            project_db.editProject(req.body, function (err) {
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: 'Failed to save'});
                    return;
                }
                res.json({});
            });
        }else{
            // async issue (?) so pid is -1 in line 52(47) despite it being changed to the correct value 
            // var hasErr = false;
            // var pid = -1;
            // project_db.createProject(req.body).catch(err => {
            //     console.log("err in line 38 "+err);
            //     hasErr = true;
            // }).then(result => {
            //     console.log("enters then in line 41");
            //     pid = result;
            //     console.log("line 43 pid: " + pid);
            //     console.log("line 44 result: " + result);
            // }).catch(err => {
            //     console.log("line 44 hasErr " + hasErr);
            //     hasErr = true;
            //     console.log(err);
            //     //return;
            // });
            // console.log("pid in line 47: "+pid);
            // if(hasErr){
            //     res.status(400).json({msg: 'Failed to create'});
            // }
            // else{
            //     res.json({pid: pid})
            // }

            var hasErr = false;
            var pid = -1;
            project_db.createProject(req.body).catch(err => {
                console.log("err in line 38 "+err);
                hasErr = true;
            }).then(result => {
                console.log("enters then in line 41");
                pid = result;
                console.log("line 43 pid: " + pid);
                console.log("line 44 result: " + result);
                if(hasErr){
                    res.status(400).json({msg: 'Failed to create'});
                }
                else{
                    res.json({pid: pid})
                }
            });

            // project_db.createProject(req.body, function (err, pid) {
            //     if (err) {
            //         console.log(err);
            //         res.status(400).json({msg: 'Failed to create'});
            //         return;
            //     }
            //     res.json({pid: pid});
            // });
        }
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
            res.status(403).json({msg: 'Not Authorized'});
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
            res.status(403).json({msg: 'Not Authorized'});
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
    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(403).json({msg: 'Not Authorized'});
            return;
        }
        else{
            let project_id = req.body.project_id;
            let user_id = req.body.user.id;
            let hasErr = false;
            project_db.approveApplicant(project_id, user_id, authService.UserRole.ProjectMember).catch(err => {
                console.log("hahahahah");
                console.log(err);
                hasErr = true;
            }).then(() =>{
                if(hasErr){
                    res.status(400).json({msg: 'Failed to approve applicant'});
                }
                else{
                    project_db.getProjectById(project_id, function(err, project){
                        if(err){
                            console.log(err);
                            res.status(400).json({msg: "Database error"});
                        }
                        else if(!project){
                            res.status(404).json({msg: "Not found"});
                        }
                        else{
                            const url = `https://${baseUrl}/project/detail?id=${project_id}`;
                            const emailDetail = {
                                to: req.body.user.email,
                                subject: "Project application result from Coding4Good",
                                html: `Thank you for your interest in the project ${project.title}.&nbsp;<br>
                                        Congratulations! Your application to team ${project.title} has been accepted! &nbsp;<br>
                                        Please follow the link to checkout your Project Leader, and Other Members &nbsp;<br>
                                        <a href='${url}'>${url}</a>`
                            };
                            emailService.sendEmail(emailDetail, function(err){
                                if(err){
                                    console.log(err);
                                    res.status(400).json({msg: 'Failed to send email'});
                                }else{
                                    res.json({});
                                }
                            });
                        }
                    });
                }
            // project_db.approveApplicant(project_id, user_id, authService.UserRole.ProjectMember, function(){
            //     if (err){
            //         console.log(err);
            //         res.status(400).json({msg: "Database error"});
            //     }else{
                    
            //     }            
            // });
            });
        }
    });
});

// router.post('/approveApplicant', function(req, res, next){
//     let roles = [authService.UserRole.Developer, 
//                 authService.UserRole.Admin,
//                 authService.UserRole.ProjectManager];
//     authService.authorizationCheck(null, req.session.uid, function(err, authorized){
//         if (err) {
//             console.log(err);
//             res.status(400).json({msg: 'Database Error'});
//             return;
//         }
//         else if(!authorized){
//             res.status(403).json({msg: 'Not Authorized'});
//             return;
//         }
//         else{
//             var project_id = req.body.project_id;
//             var user_id = req.body.user.id;
//             project_db.approveApplicant(project_id, user_id, authService.UserRole.ProjectMember, function(err){
//                 if (err){
//                     console.log(err);
//                     res.status(400).json({msg: "Database error"});
//                 }else{
//                     project_db.getProjectById(project_id, function(err, project){
//                         if(err){
//                             console.log(err);
//                             res.status(400).json({msg: "Database error"});
//                         }
//                         else if(!project){
//                             res.status(404).json({msg: "Not found"});
//                         }
//                         else{
//                             const url = `https://${baseUrl}/project/detail?id=${project_id}`;
//                             const emailDetail = {
//                                 to: req.body.user.email,
//                                 subject: "Project application result from Coding4Good",
//                                 html: `Thank you for your interest in the project ${project.title}.&nbsp;<br>
//                                         Congratulations! Your application to team ${project.title} has been accepted! &nbsp;<br>
//                                         Please follow the link to checkout your Project Leader, and Other Members &nbsp;<br>
//                                         <a href='${url}'>${url}</a>`
//                             };
//                             emailService.sendEmail(emailDetail, function(err){
//                                 if(err){
//                                     console.log(err);
//                                     res.status(400).json({msg: 'Failed to send email'});
//                                 }else{
//                                     res.json({});
//                                 }
//                             });
//                         }
//                     })
//                 }            
//             });
//         }
//     });
// });

router.post('/rejectApplicant', function(req, res, next){
    authService.authorizationCheck(null, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(403).json({msg: 'Not Authorized'});
            return;
        }
        else{
            var project_id = req.body.project_id;
            var user_id = req.body.user.id;
            project_db.rejectApplicant(project_id, user_id, function(err){
                if (err){
                    console.log(err);
                    res.status(400).json({msg: "Database error"});
                }else{
                    project_db.getProjectById(project_id, function(err, project){
                        if(err){
                            console.log(err);
                            res.status(400).json({msg: "Database error"});
                        }
                        else if(!project){
                            res.status(404).json({msg: "Not found"});
                        }
                        else{
                            // const url = `https://${baseUrl}/project/detail?id=${project_id}`;
                            // const emailDetail = {
                            //     to: req.body.user.email,
                            //     subject: "Project application result from Coding4Good",
                            //     html: `Thank you for your interest in project ${project.title}.&nbsp;<br>
                            //             Unfortunately, the team ${project.title} will not move on with your application.&nbsp;<br>
                            //             Please wait for responses from other teams.&nbsp;<br>
                            //             Also, please follow the link to contact your Project Leader for any questions!&nbsp;<br>
                            //             <a href='${url}'>${url}</a>`
                            // };
                            // emailService.sendEmail(emailDetail, function(err){
                            //     if(err){
                            //         console.log(err);
                            //         res.status(400).json({msg: 'Failed to send email'});
                            //     }else{
                            //         res.json({});
                            //     }
                            // });
                            res.json({});
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
