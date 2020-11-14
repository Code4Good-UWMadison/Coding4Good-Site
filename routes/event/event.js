const express = require('express');
const router = express.Router();
const event_db = require("../../server/event_db");
const user_db = require("../../server/user_db");
const emailService = require('../services/email_service');
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
                event_db.getEventSet((err, event_set) => {
                    if (err) {
                        console.log(err);
                        res.status(400).json({msg: 'Database Error'});
                    }
                    let followed_event_ids = JSON.parse(followed_events);
                    let followed_event_set = [];

                    event_set.forEach(function(event) {
                        if (followed_event_ids.includes(event.id)) {
                            followed_event_set.push(event);
                        }
                    });

                    res.render('event/followed', {
                        event_set: followed_event_set
                    });
                })
            })
        }
    });
});

router.get('/rsvp', function (req, res, next) {
    let event_id = req.query.id;
    let uid = req.query.user_id ? req.query.user_id : req.session.uid;
    authService.authorizationCheck(null, req.session.uid, function(err, authorized){
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
        }
        else if(!authorized) {
            res.redirect('/login');
        } else {

            user_db.getUserById(uid, (err, user_info) => {
                if (err) {
                    console.log(err);
                    res.status(400).json({msg: 'Database Error'});
                }

                let user_email = user_info.email;

                event_db.getEventById(event_id, (err, event_info) => {
                    if (err) {
                        console.log(err);
                        res.status(400).json({msg: 'Database Error'});
                    }

                    const emailDetail = {
                        to: user_email,
                        subject: event_info.title,
                        html: event_info.description
                    };

                    res.redirect('/event?status=s&msg=RSVP_email_has_been_sent');
                    /*
                    emailService.sendEmail(emailDetail, function(err){
                        if(err){
                            console.log(err);
                            res.redirect('/event?status=f');
                        }
                    });
                     */
                });
            });
        }
    });
});

module.exports = router;
