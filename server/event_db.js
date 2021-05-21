var pg = require('pg');
var config = require('./dbconfig.js');
var db = new pg.Pool(config.db);

exports.getEventSet = function (offset, callback) {
    let query = `SELECT * FROM event ORDER BY event_time DESC LIMIT 20 OFFSET $1;`;
    db.query(query, [offset], function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result.rows);
        }
    });
};

exports.createEvent = function (event, callback) {
    let query = `INSERT INTO event (title, event_time, location, description, creation_time, link, type, image) 
                              VALUES ($1, $2, $3, $4, (now() at time zone 'America/Chicago'), $5, $6, $7) returning id;`;
    db.query(
        query,
        [
            event.title,
            event.event_time,
            event.location,
            event.description,
            event.link,
            event.type,
            event.image
        ],
        function (err, eventId) {
            if (err) {
                console.log(err);
                callback(err, eventId);
            } else {
                callback(null, eventId);
            }
        }
    );
};

exports.editEvent = function (event, callback) {
    event_id = event.id;
    let query = `update event set title=$2, event_time=$3, location=$4, description=$5, link=$6, type=$7, image=$8 where id = $1;`;
    db.query(
        query,
        [
            event_id,
            event.title,
            event.event_time,
            event.location,
            event.description,
            event.link,
            event.type,
            event.image
        ],
        function (err, event_id) {
            if (err) {
                console.log(err, event_id);
                callback(err, event_id);
            } else {
                callback(null, event_id);
            }
        }
    );
};

exports.getEventById = function (eventId, callback) {
    let query = `SELECT * FROM event WHERE id=$1;`;
    db.query(query, [eventId], function (err, result) {
        if (err) {
            callback(err);
        } else {
            if (result.rows.length > 0) {
                callback(null, result.rows[0]);
            } else {
                callback('No matching event id');
            }
        }
    });
};

exports.removeEventById = function (eventId, callback) {
    let queryEvent = `DELETE FROM event WHERE id=$1;`
    db.query(queryEvent, [eventId], function (err, result) {
        if (err) {
            callback(err);
        }
        if (result.rowCount > 0) {
            callback(null);
        } else {
            callback('No matching event id');
        }
    });
}

exports.changeEventStatusCodeById = function (eventId, statusCode, callback) {
    let query = 'UPDATE event SET status = $2 WHERE id = $1;';
    db.query(query, [eventId, statusCode], function (err, result) {
        if (err) {
            callback(err);
        }
        if (result.rowCount > 0) {
            callback(null);
        } else {
            callback('No matching event id');
        }
    });
}
