var self = this;
var pg = require('pg');
var config = require('./dbconfig.js');
var index_db = new pg.Pool(config.db);

exports.createProposal = function (proposal, callback) {
    var query = `insert into proposal (org_name, org_type, org_detail, name, position, email, contact, title, description, creation_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,now() at time zone 'America/Chicago'))`;
    index_db.query(query, [proposal.org_name, proposal.org_type, proposal.org_detail, proposal.name, proposal.position, proposal.email, proposal.contact, proposal.title, proposal.description], function (err) {
        if (err) {
            console.log(err);
            callback(err);
        }
        callback(null);
    });
};