var self = this;
var pg = require('pg');
var config = require('./dbconfig.js');
var index_db = new pg.Pool(config.db);

// exports.reset = function (callback) {
//   var query = `drop table if exists user_profile;
//     drop table if exists users;
//
//     create table if not exists users(
//       id serial unique primary key,
//       email varchar(255),
//       name text,
//       password varchar(255)
//     );
//     create table if not exists user_profile(
//       id serial unique primary key,
//       uid int references users(id),
//       nickname text,
//       year int,
//       intended_teamleader boolean,
//       pl text,
//       dev text,
//       resume text
//     );
//     `; //TODO
//   index_db.query(query, function (err, result) {
//     if (err) {
//       console.log(err);
//       callback(err);
//     }
//     else {
//       console.log('All tables reset.');
//       callback(null);
//     }
//   });
// };

exports.createUser = function (user, callback) {

  var query = `insert into users (email, name, password) values($1,$2,$3);`;
  index_db.query(query, [user.email, user.fullname, user.password], function (err, result) {
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
    console.log("aa");
    var query = `select id from users where email=$1 and password=$2;`;
    index_db.query(query, [user.email, user.password], function (err, result) {
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
  index_db.query(query, [uid], function (err, result) {
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

exports.updateProfile = function (uid, profile, callback) {
  var query = `insert into user_profile (uid, nickname, year, intended_teamleader, pl, dev, resume, submission_time) values($1,$2,$3,$4,$5,$6,$7, now());`;
  index_db.query(query, [uid, profile.nickname, profile.year, profile.intended_teamleader, profile.pl, profile.dev, (profile.resume) ? profile.resume : ''], function (err, result) {
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
  index_db.query(query, [pid], function (err, result) {
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

