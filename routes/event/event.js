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
        user_db.getUserFollowedEventsByUid(req.session.uid, (err, followed_event) => {
            if (err) {
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
                let now = new Date();
                now = new Date(now - (5.5 * 60 * 60 * 1000));
                var centerIdx = eventsSet.length - 1;
                for (var i = eventsSet.length - 1; i >= 0; i--) {
                    // show the event thats coming up soon
                    if (eventsSet[i].event_time < now) {
                        break;
                    }
                    centerIdx = i;
                }
                res.render('event/index', {
                    followed_event: JSON.parse(followed_event),
                    eventsSet: eventsSet,
                    uid: req.session.uid,
                    all_user_role: authService.UserRole,
                    user_role: user_role,
                    centerIdx: centerIdx
                });
            });
        })
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
            res.status(403).json({msg: 'Not Authorized'});
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
            res.status(403).json({msg: 'Not Authorized'});
            return;
        }
        event_db.getEventById(req.query.id, function (err, event) {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
                return;
            }
            res.render('event/edit', {eventDetail: event});
        });
    });
});

module.exports = router;
