var express = require('express');
var router = express.Router();
var db = require("../../server/event_db");

router.get('/', function (req, res, next) {
    db.getEventSet(function (err, eventsSet) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        res.render('event/index', {eventsSet: eventsSet, uid: req.session.uid});
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