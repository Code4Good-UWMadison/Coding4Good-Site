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

// creat new event
exports.createEvent = function (event, callback) {
    console.log("Hello World");
    var query = `insert into event (title, event_time, location, description, creation_time, image, link, type) values($1,$2,$3,$4,$5,$6,$7,$8)`;
    event_db.query(query, [event.title, event.event_time, event.location, event.description, event.creation_time, "event.image", event.link, event.type], (err) => {
        if (err) {
            // TODO: fix the 500 bug
            console.log(err);
            callback(err);
        }
        callback(null);
    });
};