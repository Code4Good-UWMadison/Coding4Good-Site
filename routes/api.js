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

router.post('/createProject',function(req,res,next){
    db.createProject(req.body,function(err){
      if(err){
        console.log(err);
        res.status(400).json({msg: 'Database Error'});
        return;
      }
      res.json({});
    })
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

router.post('/upload_profile', function(req, res, next){
  if(req.session.uid == null){
    res.status(400).json({msg: 'Please login first'});
    return;
  }
  db.updateProfile(req.session.uid,req.body, function(err){
    if(err){
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    res.json({});
  });
});

router.post('/admin/get_profile', function(req, res, next){
  if(req.session.uid != 1){
    res.status(400).json({msg: 'Not Authorized'});
    return;
  }
  db.getProfile(req.body.pid, function(err, profile){
    if(err){
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    res.json(profile);
  });
});

router.post('/project/getProjectDetailById'function(req, res, next){
  db.getProjectById(req.body.projectId,function(err,project){
    if(err){
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    res.render('projectDetail', {project:project});
  })
});

// router.post('/project/:userId'function(req, res, next){
//   var userId = request.params.userId;
//   //find user by userId(userId, function(error, user){
//   //  if error then do..
//   //  generate page by using userInfo
//   //  res.render('project',{})
//   //})
//   //
// });

router.get('/project/get_projectSet', function(req, res, next){
  db.getProjectSet(function(err, projectSet){
    if(err){
      console.log(err);
      res.status(400).json({msg: 'Database Error'});
      return;
    }
    res.json(projectSet);
  });
});

module.exports = router;
