var self = this;
const pg = require('pg');
const config = require('./dbconfig.js');
const db = new pg.Pool(config.db);

exports.createProposal = async (proposal) => {
    // db.query(query, [proposal.org_name, proposal.org_type, proposal.org_detail, proposal.name, proposal.position, proposal.email, proposal.contact, proposal.title, proposal.description], function (err) {
      //     if (err) {
        //         console.log(err);
        //         callback(err);
        //     }
        //     callback(null);
        //});
        // (async () => {
          // note: we don't try/catch this because if connecting throws an exception
          // we don't need to dispose of the client (it will be undefined)
          //(err, client, release) => {
            //     console.log("hihihhihiihihihihi");
            //     if (err) {
              //       return console.error('Error acquiring client', err.stack)
              //     }
              //     client.query('SELECT NOW()', (err, result) => {
                //         console.log("454454445454545445454545454");
                //         release()
                //       if (err) {
                  //         return console.error('Error executing query', err.stack)
                  //       }
                  //       console.log(result.rows)
                  //     })
                  //   })
    console.log("444444444444444444444");
    const client = await db.connect();
    try {
      console.log("444444444444444444443");
      await client.query('BEGIN');
      var query = `insert into proposal (org_name, org_type, org_detail, name, position, email, contact, title, description, creation_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,now() at time zone 'America/Chicago')`;
      await db.query(query, [proposal.org_name, proposal.org_type, proposal.org_detail, proposal.name, proposal.position, proposal.email, proposal.contact, proposal.title, proposal.description]);
      await client.query('COMMIT');
    } catch (err) {
      console.log("444444444444444444442");
      await client.query('ROLLBACK');
      console.log(err);
      throw err;
      //callback(err);
    } finally {
      console.log("444444444444444444441");
      client.release();
      //callback(null);
    }
};