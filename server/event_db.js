var self = this;
var pg = require('pg');
var config = require('./dbconfig.js');
var db = new pg.Pool(config.db);

exports.getEventSet = function (callback) {
    //not quite sure from event or events
    let query = `SELECT * FROM event;`;
    db.query(query, function (err, result) {
        if (err) {
            callback(err);
        }
        else {
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
            }  else {
                callback(null, eventId);
            }
        }
    );
};

exports.getEventById = function (eventId, callback) {
    //not quite sure from event or events
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

exports.removeEventById = function(eventId, callback){
    //not quite sure from event or events
    var queryRelation = `DELETE FROM event_relation WHERE pid=$1;`;
    var queryProject = `DELETE FROM event WHERE id=$1;`
    db.query(queryRelation,[eventId],function(err){
        if(err){
            callback(err);
        }
        else{
            //not quite sure queryEvent or queryEvents
            db.query(queryEvents,[eventId],function(err,result){
                if(err){
                    callback(err);
                }
                //console.log(result.rowCount);
                if(result.rowCount>0){
                    callback(null);
                }else{
                    callback('No matching event id');
                }
            });
        }
    });
}