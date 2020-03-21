const express = require('express');
const db = require('../../server/event_db');
const router = express.Router();
const authService = require('../services/authorization_service');

//might be createEvents, not quite sure where will this be posted?
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
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }

        db.createEvent(req.body,function (err, event_id) {
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
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }

        db.editEvent(req.body, function (err) {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Failed to save'});
                return;
            }
            res.json({});
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
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }

        db.removeEventById(req.body.id,function (err) {
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