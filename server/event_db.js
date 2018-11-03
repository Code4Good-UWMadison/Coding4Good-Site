var self = this;
var pg = require('pg');
var config = require('./dbconfig.js');
var db = new pg.Pool(config.db);

exports.getEventSet = function (callback) {
    var query = `SELECT * FROM event;`;
    db.query(query, function (err, result) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, result.rows);
        }
    });
};

exports.getEventById = function (eventId, callback) {
    var query = `SELECT * FROM event WHERE id=$1;`;
    db.query(query, [eventId], function (err, result) {
        if (err) {
            callback(err);
        }
        else {
            if (result.rows.length > 0) {
                callback(null, result.rows[0]);
            }
            else {
                callback('No matching event id');
            }
        }
    });
};