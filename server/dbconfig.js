var url = require('url');
var self = this;

// postgres://eaeeeivllbbgen:1cb43862863c98fe8c57143047a6da89c4fe970bafc021d88cf8879d0da0d4f8@ec2-54-227-244-122.compute-1.amazonaws.com:5432/d90e9o960il8bo
if (process.env.DATABASE_URL) {
  var db_params = url.parse(process.env.DATABASE_URL);
  var db_auth = db_params.auth.split(':');
  self.db = {
    user: db_auth[0],
    password: db_auth[1],
    host: db_params.hostname,
    port: db_params.port,
    database: db_params.pathname.split('/')[1],
    ssl: true,
    max: 20,
    idleTimeoutMillis: 30000
  };
}
else {
  self.db = {
    user: 'buzun',
    database: 'firm',
    password: 'bakemongatari',
    host: 'localhost',
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000
  };
}

exports.self;
