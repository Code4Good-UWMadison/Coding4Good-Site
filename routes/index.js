var express = require('express');
var router = express.Router();
var db = require("../server/db");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {});
});

router.get('/about', function (req, res, next) {
    res.render('about', {});
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {});
});

router.get('/project', function (req, res, next) {
    db.getProjectSet(function (err, projectSet) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        res.render('project', {projectSet: projectSet, isMy: false, uid: req.session.uid});
    });
});

router.get('/project/my', function (req, res, next) {
    if (req.session.uid == null) {
        res.redirect('/login');
        return;
    }
    db.getAssociatedProjectsByUserId(req.session.uid, function (err, projectSet) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        res.render('project', {projectSet: projectSet, isMy: true, uid: null});
    });
});

router.get('/project/detail', function (req, res, next) {
    db.getProjectById(req.query.id, function (err, project) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        db.getAssociatedUsersByProjectId(project.id,function(err, users){
            if(err){
                console.log(err);
                res.status(400).json({msg: 'Database Error'});
                return;
            }
            res.render('projectDetail', {projectDetail: project, users: users});
        })
    });
});

router.get('/project/new', function (req, res, next) {
    if (req.session.uid == null) {
        res.redirect('/login');
        return;
    }
    if (req.session.uid != 1) {
        res.redirect('/project');
        return;
    }
    db.getAllUserNameAndId(function(err, allUserNameAndId){
        if(err){
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        res.render('projectCreate', {allUserNameAndId:allUserNameAndId});
    })
});

router.get('/project/edit', function (req, res, next) {
    if (req.session.uid == null) {
        res.redirect('/login');
        return;
    }
    if (req.session.uid != 1) {
        res.redirect('/project');
        return;
    }
    db.getProjectById(req.query.id, function (err, project) {
        if (err) {
            console.log(err);
            res.status(400).json({msg: 'Database Error'});
            return;
        }
        db.getAssociatedUsersByProjectId(project.id,function(err, users){
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
                res.render('projectEdit', {projectDetail: project, users: users, allUserNameAndId:allUserNameAndId});
            });
        });
    });
});

router.get('/profile', function (req, res) {
    if (req.session.uid == null) {
        res.redirect('/login');
        return;
    }
    res.render('profile');
});

router.get('/admin', function (req, res) {
    if (req.session.uid == null) {
        res.redirect('/login');
        return;
    }
    if (req.session.uid != 1) {
        res.redirect('/');
        return;
    }
    res.render('admin');
});

router.get('/upload-complete', function (req, res) {
    if (req.session.uid == null) {
        res.redirect('/login');
        return;
    }
    res.render('upload-complete');
});


router.get('/login', function (req, res, next) {
    res.render('login', {});
});

router.get('/signup', function (req, res, next) {
    res.render('signup', {});
});

router.get('/logout', function (req, res, next) {
    req.session.uid = null;
    res.redirect('/');
});

// router.get('/proposal', function (req, res) {
//     if (req.session.uid == null) {
//         res.redirect('/login');
//         return;
//     }
//     res.render('proposal');
// });

module.exports = router;
