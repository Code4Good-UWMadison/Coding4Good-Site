var self = this;
var pg = require('pg');
var config = require('./dbconfig.js');
// var bcrypt = require('bcrypt');
var uuid4 = require('uuid4');
var db = new pg.Pool(config.db);

exports.reset = function (callback) {
  var query = `drop table if exists user_profile;
    drop table if exists users;

    create table if not exists users(
      id serial unique primary key,
      email varchar(255),
      name text,
      password varchar(255)
    );
    create table if not exists user_profile(
      id serial unique primary key,
      uid int references users(id),
      nickname text,
      year int,
      intended_teamleader boolean,
      pl text,
      dev text,
      resume text
    );
    `; //TODO
  db.query(query, function (err, result) {
    if (err) {
      console.log(err);
      callback(err);
    }
    else {
      console.log('All tables reset.');
      callback(null);
    }
  });
};

exports.createUser = function (user, callback) {

  var query = `insert into users (email, name, password) values($1,$2,$3);`;
  db.query(query, [user.email, user.fullname, user.password], function (err, result) {
    if (err) {
      console.log(err);
      callback(err);
    }
    else {
      exports.verifyUser(user, callback);
    }
  });
};

exports.verifyUser = function (user, callback) {
  var query = `select id from users where email=$1 and password=$2;`;
  db.query(query, [user.email, user.password], function (err, result) {
    if (err) {
      callback(err);
    }
    else {
      if (result.rows.length == 0) {
        callback(null, null);
      }
      else {
        callback(null, result.rows[0].id);
      }
    }
  });
};

exports.getUserInfo = function (uid, callback) {
  var query = `select email,name as fullname from users where id=$1;`;
  db.query(query, [uid], function (err, result) {
    if (err) {
      callback(err);
    }
    else {
      if (result.rows.length == 0) {
        callback(null, null);
      }
      else {
        callback(null, result.rows[0]);
      }
    }
  });
};

exports.getAllUserNameAndId = function(callback){
  var query = `select name,id from users;`;
  db.query(query,function(err,result){
      if(err){
          callback(err);
      }
      else{
          callback(null,result.rows);
      }
    });
};

exports.updateProfile = function (uid, profile, callback) {
  var query = `insert into user_profile (uid, nickname, year, intended_teamleader, pl, dev, resume) values($1,$2,$3,$4,$5,$6,$7);`;
  db.query(query, [uid, profile.nickname, profile.year, profile.intended_teamleader, profile.pl, profile.dev, (profile.resume) ? profile.resume : ''], function (err, result) {
    if (err) {
      callback(err);

    }
    else {
      callback(null);
    }
  });
};

exports.getProfile = function (pid, callback) {
  var query = `select
      u.name as name,
      n.nickname as nickname,
      n.year as year,
      n.intended_teamleader as intended_teamleader,
      n.pl as pl,
      n.dev as dev,
      n.resume as resume
    from user_profile as n, users as u where n.id=$1 and n.uid=u.id;`;
  db.query(query, [pid], function (err, result) {
    if (err) {
      callback(err);

    }
    else {
      if (result.rows.length > 0) {
        callback(null, result.rows[0]);
      }
      else {
        callback('No matching profile id');
      }
    }
  });
};

exports.editProject = function (project, callback){
    var status=project.status;
    if(status==0){
        status = "Starting";
    }
    else if(status ==1){
        status = "In Progress";
    }
    else if(status==2){
        status = "On Hold";
    }
    else if (status==3) {
        status = "Succeed";
    }
    else if (status==4){
        status = "Failed";
    }
    else if (status==5){
        status = "Maintaining";
    }
    var query = `update project set title=$2, description=$3, contact=$4, npo=$5, status=$6 where project.id = $1;`;
    var oldLink = `DELETE FROM project_relation WHERE project_relation.pid = $1`;
    var newLink = `insert into project_relation(pid, uid, relation) values($1,$2,$3);`
    db.query(query, [project.id, project.title, project.description, project.contact, project.npo,status], function (err) {
        db.query(oldLink,[project.id],function (err) {
            if(err){
                console.log(err);
                callback(err);
            }
        });
        if (err) {
            console.log(err);
            callback(err);
        }
        else if(project.team!=null){
            if(project.team.length>0){
                var team = project.team;
                team.forEach(function(person){
                    var uid = parseInt(person.id);
                    var memberTitle=person.memberTitle;
                    db.query(newLink,[project.id,uid,memberTitle], function(err){
                        if(err){
                            console.log(err);
                            callback(err);
                        }
                    });
                });
            }
        }
        callback(null);
    });
}

exports.createProject = function (project, callback) {
  var status=project.status;
  if(status==0){
    status = "Starting";
  }
  else if(status ==1){
    status = "In Progress";
  }
  else if(status==2){
    status = "On Hold";
  }
  else if (status==3) {
    status = "Succeed";
  }
  else if (status==4){
    status = "Failed";
  }
  else if (status==5){
    status = "Maintaining";
  }
  var query = `insert into project (title, description, contact, npo, creation_time,status) values($1,$2,$3,$4,now(),$5) returning id;`;
  var link = `insert into project_relation(pid, uid, relation) values($1,$2,$3);`
  db.query(query, [project.title, project.description, project.contact, project.npo,status], function (err,projectId) {
    if (err) {
      console.log(err);
      callback(err);
    }
    else if(project.team!=null){
      if(project.team.length>0){
        var team = project.team;
        team.forEach(function(person){
          var uid = parseInt(person.id);
          var memberTitle=person.memberTitle;
          db.query(link,[projectId.rows[0].id,uid,memberTitle], function(err){
            if(err){
              console.log(err);
              callback(err);
            }
          });
        });
      }
    }
    callback(null);
  });
};

exports.getProjectSet = function (callback) {
  var query = `SELECT * FROM project;`;
  db.query(query, function (err, result) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, result.rows);
    }
  });
};

exports.getAssociatedProjectsByUserId = function (uid, callback) {
  var query = `SELECT * FROM project_relation r, users u, project p where u.id = r.uid and u.id = $1 and p.id = r.pid`;
  db.query(query, [uid], function (err, result) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, result.rows);
    }
  });
};

exports.getAssociatedUsersByProjectId = function (projectId, callback) {
    var query = `SELECT u.name as name, r.relation as relation, u.id as uid FROM project_relation r, users u, project p where u.id = r.uid and p.id = $1 and p.id = r.pid`;
    db.query(query, [projectId], function (err, result) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, result.rows);
        }
    });
};

exports.getProjectById = function (projectId, callback) {
  var query = `SELECT * FROM project WHERE id=$1;`;
  db.query(query, [projectId], function (err, result) {
    if (err) {
      callback(err);
    }
    else {
      if (result.rows.length > 0) {
        callback(null, result.rows[0]);
      }
      else {
        callback('No matching project id');
      }
    }
  });
};

exports.removeProjectById = function(projectId, callback){
    var query = `DELETE FROM project WHERE id = $1`;
    db.qeury(query,[projectId],function(err,result){
        if(err){
            callback(err);
        }
        else{
            if(result.affectedRows>0){
                callback(null);
            }
            else{
                callback('No matching project id');
            }
        }
    });
}
