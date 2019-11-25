var self = this;
var pg = require('pg');
var config = require('./dbconfig.js');
var index_db = new pg.Pool(config.db);
var bcrypt = require('bcrypt');

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
//
//     // Add seeded data
//     insert into users (email, name, password, create_date) values('uwmcfg@wd.owner','Web Owner','UwmC4gWd@Year.1',now() at time zone 'America/Chicago');`;
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
  // the higher the saltRound the longer to hash the password
  var saltRounds = 10;
  bcrypt.hash(user.password, saltRounds, function(err, hash){
    if(err){
      console.log(err);
      callback(err);
    }
    var query = `INSERT INTO users (email, name, password, create_date, email_verified) VALUES ($1,$2,$3,now() at time zone 'America/Chicago', false);`;
    index_db.query(query, [user.email, user.fullname, hash], function (err, result) {
      if (err) {
        console.log(err);
        callback(err);
      }
      else{
        exports.verifyUser(user, callback);
      }
    });
  });
};

exports.removeUser = function (uid, callback){
  var query = `DELETE FROM users WHERE id = $1;`;
  index_db.query(query, [uid], function (err) {
    if(err) {
      console.log(err);
      callback(err);
    }
    else {
      callback(null);
    }
  });
}

exports.verifyUser = function (user, callback) {
  var query = `SELECT id, password FROM users WHERE email = $1;`;
  index_db.query(query, [user.email], function(err, result) {
    if (err) {
      console.log(err);
      callback(err);
    }
    else{
      // if user is not found
      if (result.rows.length == 0) {
        callback(null, null);
      }
      else {
        bcrypt.compare(user.password, result.rows[0].password, function(err, res) {
          if(err){
            console.log(err);
            callback(err);
          }
          // if wrong password
          else if (!res) {
            callback(null, null);
          }
          else{
            callback(null, result.rows[0].id);
          }
        });
      }
    }
  });
}

exports.getUserInfo = function (uid, callback) {
  var query = `SELECT email, name AS fullname FROM users WHERE id=$1;`;
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
  var query = `INSERT INTO user_profile (uid, nickname, year, intended_teamleader, pl, dev, resume, submission_time) VALUES ($1,$2,$3,$4,$5,$6,$7, now() at time zone 'America/Chicago');`;
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
  var query = `SELECT
      u.name AS name,
      n.nickname AS nickname,
      n.year AS year,
      n.intended_teamleader AS intended_teamleader,
      n.pl AS pl,
      n.dev AS dev,
      n.resume AS resume
      FROM user_profile AS n, users AS u WHERE n.id=$1 AND n.uid=u.id;`;
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

exports.verifyEmailByUserId = function (uid, callback){
  var query = `UPDATE users SET email_verified = true WHERE id = $1;`;
  index_db.query(query, [uid], function (err) {
    if (err) {
      callback(err);
    }else{
      callback(null);
    }
  });
};

exports.checkEmailVerificationByUid = function (uid, callback){
  var query = `SELECT email_verified FROM users WHERE id = $1;`;
  index_db.query(query, [uid], function(err, result){
    if (err){
      callback(err);
    }
    else{
      if (result.rows.length > 0){
        callback(null, result.rows[0].email_verified);
      }
      else{
        callback(null);
      }
    }
  });
};


