var self = this;
var pg = require('pg');
var config = require('./dbconfig.js');
var bcrypt = require('bcrypt');
var uuid4 = require('uuid4');
var db = new pg.Pool(config.db);

exports.reset = function(callback) {
  var query = `drop table if exists users;
    drop table if exists project_relation;
    drop table if exists project;

    create table if not exists users(
      id serial unique primary key,
      email varchar(255),
      name text,
      password varchar(255)
    );
    create table if not exists project(
      id serial unique primary key,
      title text,
      description text,
      leader text
    );
    create table if not exists project_relation(
      id serial unique primary key,
      pid int references project(id),
      name text,
      relation text
    );
    `
  db.query(query, function(err, result) {
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

exports.createUser = function(user, callback){

  var query = `insert into users (email, name, password) values($1,$2,$3);`;
  db.query(query, [user.email, user.fullname, user.password], function(err, result){
    if (err) {
      console.log(err);
      callback(err);
    }
    else {
      exports.verifyUser(user, callback);
    }
  });
};

exports.verifyUser = function(user, callback){
  var query = `select id from users where email=$1 and password=$2;`;
  db.query(query, [user.email, user.password], function(err, result){
    if(err){
      callback(err);
    }
    else{
      if(result.rows.length==0){
        callback(null, null);
      }
      else{
        callback(null, result.rows[0].id);
      }

    }
  });
};

exports.getUserInfo = function(uid, callback){
  var query = `select email,name as fullname from users where id=$1;`;
  db.query(query, [uid], function(err, result){
    if(err){
      callback(err);
    }
    else{
      if(result.rows.length==0){
        callback(null, null);
      }
      else{
        callback(null, result.rows[0]);
      }
    }
  });
};
