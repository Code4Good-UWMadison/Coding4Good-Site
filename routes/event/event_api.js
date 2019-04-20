var express = require('express');
var db = require('../../server/event_db');
var router = express.Router();

//might be createEvents, not quite sure where will this be posted?
router.post('/createEvent', function (req, res, next) {
    if (req.session.uid != 1) {
        console.log("Hello 1");
        res.status(400).json({msg: 'Not Authorized'});
        return;
    }
    db.createEvent(req.body, function (err) {
        if (err) {
            console.log("Hello 2");
            console.log(err);
            res.status(400).json({msg: 'Failed to create'});
            return;
        }
        res.json({});
    });
});

router.post('/saveEvent', function (req, res, next) {
    if (req.session.uid != 1) {
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

router.post('/removeEvent', function(req, res, next){
    if(req.session.uid!=1){
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
})

module.exports = router;