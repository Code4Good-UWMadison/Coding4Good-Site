var self = this;
var pg = require('pg');
var config = require('./dbconfig.js');
var db = new pg.Pool(config.db);

exports.getEventSet = function (callback) {
    //not quite sure from event or events
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