const express = require('express');
const router = express.Router();
const db = require("../../server/event_db");
const user_db = require("../../server/user_db");
const authService = require('../services/authorization_service');

router.get('/', function (req, res, next) {
    db.getEventSet(function (err, eventsSet) {
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
            res.render('event/index', {eventsSet: eventsSet, uid: req.session.uid, all_user_role: authService.UserRole, user_role: user_role});
        });
    });
});

router.get('/create', function (req, res, next) {
    if (req.session.uid == null) {
        res.redirect('../login');
        return;
    }
    res.render('event/create', {uid: req.session.uid});
});

router.get('/edit', function (req, res, next) {
    if (req.session.uid == null) {
        res.redirect('/login');
        return;
    }
    if (req.session.uid != 1) {
        res.redirect('/events');
        return;
    }
    db.getEventById(req.query.id, function (err, event) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        //Not quite sure what is the part inside render
        res.render('event/edit', {});
    });
});

module.exports = router;