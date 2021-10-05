var self = this;
var pg = require("pg");
var config = require("./dbconfig.js");
var db = new pg.Pool(config.db);
var bcrypt = require("bcryptjs");

// exports.reset = function (callback) {
//     var query = `drop table if exists user_profile;
//         drop table if exists users;
//
//         create table if not exists users(
//             id serial unique primary key,
//             email varchar(255),
//             name text,
//             password varchar(255)
//         );
//         create table if not exists user_profile(
//             id serial unique primary key,
//             uid int references users(id),
//             nickname text,
//             year int,
//             intended_teamleader boolean,
//             pl text,
//             dev text,
//             resume text
//         );
//
//         // Add seeded data
//         insert into users (email, name, password, create_date) values('uwmcfg@wd.owner','Web Owner','UwmC4gWd@Year.1',now() at time zone 'America/Chicago');`;
//         `; //TODO
//     db.query(query, function (err, result) {
//         if (err) {
//             console.log(err);
//             callback(err);
//         }
//         else {
//             console.log('All tables reset.');
//             callback(null);
//         }
//     });
// };

exports.createUser = function(user, callback) {
    // the higher the saltRound the longer to hash the password
    var saltRounds = 10;
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        if (err) {
            console.log(err);
            callback(err);
        }
        var query = `INSERT INTO users (email, name, password, create_date, email_verified) VALUES ($1,$2,$3,now() at time zone 'America/Chicago', false);`;
        db.query(query, [user.email, user.fullname, hash], function(err, result) {
            if (err) {
                if (err.code != 23505) {
                    console.log(err);
                }
                callback(err);
            } else {
                exports.verifyUser(user, callback);
            }
        });
    });
};

exports.removeUser = function(uid, callback) {
    var query = `DELETE FROM users WHERE id = $1;`;
    db.query(query, [uid], function(err) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            callback(null);
        }
    });
};

// verify if user's credential is valid
exports.verifyUser = function(user, callback) {
    var query = `SELECT id, password FROM users WHERE email = $1;`;
    db.query(query, [user.email], function(err, result) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            // if user is not found
            if (result.rows.length == 0) {
                callback(null, null);
            } else {
                bcrypt.compare(user.password, result.rows[0].password, function(
                    err,
                    res
                ) {
                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                    // if wrong password
                    else if (!res) {
                        callback(null, null);
                    } else {
                        callback(null, result.rows[0].id);
                    }
                });
            }
        }
    });
};

exports.getUserInfo = function(uid, callback) {
    var query = `SELECT email, name AS fullname FROM users WHERE id=$1;`;
    db.query(query, [uid], function(err, result) {
        if (err) {
            callback(err);
        } else {
            if (result.rows.length == 0) {
                callback(null, null);
            } else {
                callback(null, result.rows[0]);
            }
        }
    });
};

exports.getUserById = function (uid, project_id, callback) {
    var query = `SELECT u.id, u.email, u.name FROM users as u WHERE u.id=$1;`;
    
    db.query(query, [uid], function (err, result) {
        if (err) {
            callback(err);
        }
        else if(!project_id)
        {
            callback(null, result.rows[0]);
        } 
        else    
        { 
            var query2=`SELECT reason, intended_teamleader,contribution,active_participation,interests,time_for_project,application_date FROM project_application_relation WHERE user_id=$1 AND project_id=$2;`
                 db.query(query2,[uid,project_id], function(err, res) {
                    if (err) {
                        console.log(err)
                        callback(err);
                    } else {
                        callback(null,{...result.rows[0],...res.rows[0]})
                    }
        })}

    });
};

exports.updateProfile = function(uid, profile, callback) {
    let insert =
        "INSERT INTO user_profile (uid, nickname, year, pl, dev, resume, submission_time,description) VALUES ($1,$2,$3,$4,$5,$6, now() at time zone 'America/Chicago',$7)";
    let update =
        "DO UPDATE SET nickname=$2, year=$3, pl=$4, dev=$5, resume=$6, submission_time=now() at time zone 'America/Chicago',description=$7;";
    let query = insert + " ON CONFLICT (uid)" + update;
    db.query(
        query,
        [
            uid,
            profile.nickname ? profile.nickname : "",
            profile.year,
            profile.pl,
            profile.dev,
            profile.resume ? profile.resume : "",
            profile.description ? profile.description : ""
        ],
        function(err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        }
    );
};

exports.getProfileByUserId = function(user_id, callback) {
    var query = `SELECT * FROM user_profile WHERE user_profile.uid = $1;`;
    db.query(query, [user_id], function(err, result) {
        if (err) {
            callback(err);
        } else {
            if (result.rows.length > 0) {
                callback(null, result.rows[0]);
            } else {
                callback(null, null);
            }
        }
    });
};

exports.verifyEmailByUserId = function(uid, callback) {
    var query = `UPDATE users SET email_verified = true WHERE id = $1;`;
    db.query(query, [uid], function(err) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};

exports.checkEmailVerificationByUid = function(uid, callback) {
    var query = `SELECT email_verified FROM users WHERE id = $1;`;
    db.query(query, [uid], function(err, result) {
        if (err) {
            callback(err);
        } else {
            if (result.rows.length > 0) {
                callback(null, result.rows[0].email_verified);
            } else {
                callback(null);
            }
        }
    });
};

exports.getUserRoleByUid = function(user_id, callback) {
    var query = `SELECT user_role, associated_project_id FROM user_role WHERE user_id = $1;`;
    db.query(query, [user_id], function(err, result) {
        if (err) {
            callback(err);
        } else {
            if (result.rows.length > 0) {
                callback(null, result.rows);
            } else {
                callback(null, null);
            }
        }
    });
};

// replace all roles (that are not associated with a project) by new roles of a user of given id
// input: user_id int
// input: roles string[]
exports.setUserRoleByUid = async (user_id, roles) => {
    if(!roles){
        roles = [];
    }
    const remove = `DELETE FROM user_role WHERE user_id = $1 AND associated_project_id IS NULL;`;
    const insert = `INSERT INTO user_role (user_id, user_role) VALUES ($1, $2)`;
    const client = await db.connect();
    try{
        await client.query("BEGIN");
        await client.query(remove, [user_id]);

        for (var i = 0; i < roles.length; i++){
            await client.query(insert, [user_id, roles[i]]);
        }
        await client.query("COMMIT");
    }catch(err){
        await client.query("ROLLBACK");
        throw err;
    }finally{
        client.release();
    }
};

exports.getAllUser = function(callback) {
    var query = `SELECT id, email, name, create_date FROM users;`;
    db.query(query, function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result.rows);
        }
    });
};

exports.getUserByEmail = function(email, callback){
    var query = `SELECT id FROM users WHERE email=$1;`;
    db.query(query, [email], function (err, result) {
        if (err) {
            callback(err);
        }
        else {
            if (result.rows.length == 0) {
                callback(null, null);
            }
            else {
                callback(null, result.rows[0]);
            }
        }
    });
};

exports.resetPassword = function(password, email, user_id, callback) {
    var saltRounds = 10;
    bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
            callback(err);
        } 
        else {
            var query = `UPDATE users SET password = $1 WHERE email = $2 AND id = $3;`;
            db.query(query, [hash, email, user_id], function(err) {
                if (err) {
                    callback(err); 
                } else {
                    callback(null);
                }
            });
        }
    });
};

exports.getUnconfirmedUsers = function(callback) {
    var query = `SELECT id, create_date FROM users WHERE email_verified = false;`;
    db.query(query, function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result.rows);
        }
    })
};