const express = require('express');
const router = express.Router();
const event_db = require("../../server/event_db");
const user_db = require("../../server/user_db");
const authService = require('../services/authorization_service');

router.get('/', function (req, res, next) {
    event_db.getEventSet(function (err, eventsSet) {
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
            eventsSet = eventsSet.sort(function (a, b) {
                return a.event_time - b.event_time
            })
            res.render('event/index', {eventsSet: eventsSet, uid: req.session.uid, all_user_role: authService.UserRole, user_role: user_role});
        });
    });
});

router.get('/create', function (req, res, next) {
    if (req.session.uid == null) {
        res.redirect('../login');
        return;
    }
    let roles = [authService.UserRole.Developer,
        authService.UserRole.Admin,
        authService.UserRole.EventExecutive];

    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }
        res.render('event/create', {uid: req.session.uid});
    });
});

router.get('/edit', function (req, res, next) {
    if (req.session.uid == null) {
        res.redirect('/login');
        return;
    }
    let roles = [authService.UserRole.Developer,
        authService.UserRole.Admin,
        authService.UserRole.EventExecutive];

    authService.authorizationCheck(roles, req.session.uid, function(err, authorized){
        if (err) {
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        else if(!authorized){
            res.status(400).json({msg: 'Not Authorized'});
            return;
        }
        console.log(req.query.id);
        event_db.getEventById(req.query.id, function (err, event) {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
                return;
            }
            //Not quite sure what is the part inside render
            res.render('event/edit', {eventDetail: event});
        });
    });
});

module.exports = router;