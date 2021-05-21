const express = require('express');
const router = express.Router();
const event_db = require("../../server/event_db");
const user_db = require("../../server/user_db");
const authService = require('../services/authorization_service');

router.get('/', function (req, res, next) {
    let offset = 0;
    let uid = req.session.uid;
    event_db.getEventSet(offset, function (err, events_set) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        user_db.getUserRoleByUid(uid, (err, user_role) => {
            if (err) {
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
                return;
            }
            user_db.getUserFollowedEventsByUid(uid, (err, followed_events) => {
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: 'Database Error'});
                    return;
                }
                user_db.getUserRSVPEventsByUid(uid, (err, rsvp_events) => {
                    if (err) {
                        console.log(err);
                        res.status(400).json({msg: 'Database Error'});
                        return;
                    }
                    events_set = events_set.sort((event_a, event_b) => {
                        return event_a.event_time - event_b.event_time
                    })
                    let now = new Date();
                    now = new Date(now - (5.5 * 60 * 60 * 1000));
                    let center_idx = events_set.length - 1;
                    for (let i = events_set.length - 1; i >= 0; i--) {
                        if (events_set[i].event_time < now) {
                            break;
                        }
                        center_idx = i;
                    }
                    res.render('event/index', {
                        followed_events: JSON.parse(followed_events),
                        rsvp_events: JSON.parse(rsvp_events),
                        eventsSet: events_set,
                        uid: req.session.uid,
                        all_user_role: authService.UserRole,
                        user_role: user_role,
                        centerIdx: center_idx
                    });
                });
            });
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

router.get('/followed', function (req, res, next) {
    let uid = req.query.user_id ? req.query.user_id : req.session.uid;
    authService.authorizationCheck(null, req.session.uid, function(err, authorized){
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
        }
        else if(!authorized) {
            res.redirect('/login');
        } else {
            user_db.getUserFollowedEventsByUid(uid, (err, followed_events) => {
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: 'Database Error'});
                } else {
                    event_db.getEventSet((err, event_set) => {
                        if (err) {
                            console.log(err);
                            res.status(400).json({msg: 'Database Error'});
                        }
                        let followed_event_ids = JSON.parse(followed_events);
                        let followed_event_set = [];

                        event_set.forEach(function (event) {
                            if (followed_event_ids.includes(event.id)) {
                                followed_event_set.push(event);
                            }
                        });

                        res.render('event/followed', {
                            event_set: followed_event_set
                        });
                    });
                }
            });
        }
    });
});

module.exports = router;
