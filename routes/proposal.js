var express = require('express');
var router = express.Router();
var db = require("../server/db");

router.get('/proposal', function (req, res, next) {
  db.getProjectSet(function (err, proposalSet) {
    if (err) {
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    res.render('proposal/create', {proposalSet: proposalSet, isMy: false, uid: req.session.uid});
  });
});

router.get('/proposal/my', function (req, res, next) {
  if (req.session.uid === null) {
    res.redirect('/login');
    return;
  }
  db.getAssociatedProjectsByUserId(req.session.uid, function (err, proposalSet) {
    if (err) {
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    res.render('proposal/index', {proposalSet: proposalSet, isMy: true, uid: null});
  });
});

router.get('/proposal/detail', function (req, res, next) {
  db.getProjectById(req.query.id, function (err, proposal) {
    if (err) {
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    db.getAssociatedUsersByProjectId(proposal.id,function(err, users){
      if(err){
        console.log(err);
        res.status(400).json({msg: 'Database Error'});
        return;
      }
      res.render('proposal/detail', {proposalDetail: proposal, users: users,uid:req.session.uid});
    })
  });
});

router.get('/proposal/create', function (req, res, next) {
  if (req.session.uid === null) {
    res.redirect('/login');
    return;
  }
  if (req.session.uid !== 1) {
    res.redirect('/proposal');
    return;
  }
  db.getAllUserNameAndId(function(err, allUserNameAndId){
    if(err){
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    res.render('proposal/create', {allUserNameAndId:allUserNameAndId});
  })
});

router.get('/proposal/edit', function (req, res, next) {
  if (req.session.uid === null) {
    res.redirect('/login');
    return;
  }
  if (req.session.uid !== 1) {
    res.redirect('/proposal');
    return;
  }
  db.getProjectById(req.query.id, function (err, proposal) {
    if (err) {
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    db.getAssociatedUsersByProjectId(proposal.id,function(err, users){
      if(err){
        console.log(err);
        res.status(400).json({msg: 'Database Error'});
        return;
      }
      db.getAllUserNameAndId(function(err, allUserNameAndId){
        if(err){
          console.log(err);
          res.status(400).json({msg: 'Database Error'});
          return;
        }
        res.render('proposal/edit', {proposalDetail: proposal, users: users, allUserNameAndId:allUserNameAndId});
      });
    });
  });
});

module.exports = router;
