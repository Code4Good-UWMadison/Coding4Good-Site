const express = require('express');
const event_db = require('../../server/event_db');
const router = express.Router();
const authService = require('../services/authorization_service');

router.post('/createEvent', function (req, res, next) {
    let roles = [authService.UserRole.Developer,
        authService.UserRole.Admin,
        authService.UserRole.EventExecutive]; // event executive can create event

    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(403).json({msg: 'Not Authorized'});
            return;
        }

        event_db.createEvent(req.body,function (err, event_id) {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Datebase Error; failed to create an event'});
                return;
            }
            res.json({event_id: event_id});
        });
    });
});

router.post('/saveEvent', function (req, res, next) {
    let roles = [authService.UserRole.Developer,
        authService.UserRole.Admin,
        authService.UserRole.EventExecutive]; // event executive can create event

    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(403).json({msg: 'Not Authorized'});
            return;
        }

        event_db.editEvent(req.body, function (err, event_id) {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Datebase Error; Failed to save'});
                return;
            }
            res.json({event_id: event_id});
        });
    });
});

router.post('/removeEvent', function(req, res, next){
    let roles = [authService.UserRole.Developer,
        authService.UserRole.Admin,
        authService.UserRole.EventExecutive]; // event executive can create event

    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(403).json({msg: 'Not Authorized'});
            return;
        }

        event_db.removeEventById(req.body.event_id,function (err) {
            if(err){
                console.log(err);
                res.status(400).json({msg: 'Failed to remove'});
                return;
            }
            res.json({});
        });
    });
});

module.exports = router;
