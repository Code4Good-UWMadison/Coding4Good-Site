var express = require('express');
var router = express.Router();
var db = require("../server/db");

router.get('/', function (req, res, next) {
    res.render('index', {});
});

router.get('/about', function (req, res, next) {
    res.render('about', {});
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {});
});

router.get('/profile', function (req, res) {
  if (req.session.uid == null) {
    res.redirect('/login');
    return;
  }
  res.render('user/profile');
});

router.get('/upload-complete', function (req, res) {
    if (req.session.uid === null) {
        res.redirect('/login');
        return;
    }
    res.render('user/upload-complete');
});

router.get('/login', function (req, res, next) {
    res.render('user/login', {});
});

router.get('/signup', function (req, res, next) {
    res.render('user/signup', {});
});

router.get('/logout', function (req, res, next) {
    req.session.uid = null;
    res.redirect('/');
});

router.get('/admin', function (req, res) {
  if (req.session.uid !== 1) {
    res.redirect('/');
    return;
  }
  res.render('admin');
});

router.get('/events', function (req, res, next) {
    db.getEventSet(function (err, eventsSet) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        res.render('events', {eventsSet: eventsSet, uid: req.session.uid});
    });
});

router.get('/events/new', function (req, res, next) {
    if (req.session.uid == null) {
        res.redirect('/login');
        return;
    }
    if (req.session.uid != 1) {
        res.redirect('/events');
        return;
    }
        //Not quite sure what is the part inside render
        res.render('eventsCreate', {});
});

router.get('/events/edit', function (req, res, next) {
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
        res.render('eventEdit', {});
    });
});

module.exports = router;
