var express = require('express');
var db = require('../server/db');
var router = express.Router();

router.post('/proposal', function(req, res, next) {
  res.json({});
});

router.get('/account_check', function(req, res, next){
  if(req.session.uid != null){
    db.getUserInfo(req.session.uid, function(err, user){
      if(err){
        console.log(err);
        res.status(400).json({msg: 'Database Error'});
        return;
      }
      res.json(user);
    });
  }
  else{
    res.json({id: -1});
  }
});

router.post('/signup', function(req, res, next){
  db.createUser(req.body, function(err, uid){
    if(err){
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    req.session.uid=uid;
    res.json({});
  });
});

router.post('/login', function(req, res, next){
  db.verifyUser(req.body, function(err, uid){
    if(err){
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    if(uid) {
      req.session.uid=uid;
      res.json({});
    }
    else {
      res.status(400).json({msg: 'Username or password is wrong'});
    }
  });
});

module.exports = router;
