var self = this;
var pg = require('pg');
var config = require('./dbconfig.js');
var bcrypt = require('bcrypt');
var uuid4 = require('uuid4');
var db = new pg.Pool(config.db);

const saltRounds = 10;

exports.patch_competitions = function() {
  var defer = q.defer();
  var query = 'ALTER TABLE competitions ADD initial_index int;';
  db.query(query, function(err, result) {
    defer.resolve();
  });
  return defer.promise;
};

exports.reset = function(callback) {
  var query = `drop table if exists project;
    drop table if exists project_relation;
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
