var self = this;
var pg = require("pg");
var config = require("./dbconfig.js");
var db = new pg.Pool(config.db);

exports.editProject = function(project, callback) {
  const query = `update project set title=$2, description=$3, contact=$4, org_name=$5, status=$6, project_link=$7, video_link=$8 where project.id = $1;`;
  const oldLink = `DELETE FROM project_relation WHERE project_relation.pid = $1`;
  const newLink = `insert into project_relation(pid, uid, relation) values($1,$2,$3);`;
  db.query(
    query,
    [
      project.id,
      project.title,
      project.description,
      project.contact,
      project.org_name,
      project.status,
      project.project_link,
      project.video_link
    ],
    function(err) {
      db.query(oldLink, [project.id], function(err) {
        if (err) {
          console.log(err);
          callback(err);
        }
      });
      if (err) {
        console.log(err);
        callback(err);
      } else if (project.team != null) {
        if (project.team.length > 0) {
          var team = project.team;
          team.forEach(function(person) {
            var uid = parseInt(person.id);
            var memberTitle = person.memberTitle;
            db.query(newLink, [project.id, uid, memberTitle], function(err) {
              if (err) {
                console.log(err);
                callback(err);
              }
            });
          });
        }
      }
      callback(null);
    }
  );
};

exports.createProject = function(project, callback) {
  var query = `insert into project (title, description, contact, org_name, creation_time, status, project_link, video_link) values($1,$2,$3,$4,(now() at time zone 'America/Chicago'),$5, $6, $7) returning id;`;
  var link = `insert into project_relation(pid, uid, relation) values($1,$2,$3);`;
  db.query(
    query,
    [
      project.title,
      project.description,
      project.contact,
      project.org_name,
      project.status,
      project.project_link,
      project.video_link
    ],
    function(err, projectId) {
      if (err) {
        console.log(err);
        callback(err);
      } else if (project.team != null) {
        if (project.team.length > 0) {
          var team = project.team;
          team.forEach(function(person) {
            var uid = parseInt(person.id);
            var memberTitle = person.memberTitle;
            db.query(link, [projectId.rows[0].id, uid, memberTitle], function(
              err
            ) {
              if (err) {
                console.log(err);
                callback(err);
              }
            });
          });
        }
      }
      callback(null);
    }
  );
};

exports.getProjectSet = function(callback) {
  var query = `SELECT * FROM project;`;
  db.query(query, function(err, result) {
    if (err) {
      callback(err);
    } else {
      callback(null, result.rows);
    }
  });
};

exports.getAssociatedProjectsByUserId = function(uid, callback) {
  var query = `SELECT * FROM project_relation r, users u, project p WHERE u.id = r.uid AND u.id = $1 AND p.id = r.pid`;
  db.query(query, [uid], function(err, result) {
    if (err) {
      callback(err);
    } else {
      callback(null, result.rows);
    }
  });
};

exports.getAssociatedUsersByProjectId = function(projectId, callback) {
  var query = `SELECT u.name AS name, r.relation AS relation, u.id AS uid, u.email AS email 
                FROM project_relation r, users u, project p 
                WHERE u.id = r.uid AND p.id = $1 AND p.id = r.pid`;
  db.query(query, [projectId], function(err, result) {
    if (err) {
      callback(err);
    } else {
      callback(null, result.rows);
    }
  });
};

exports.getProjectById = function(projectId, callback) {
  var query = `SELECT * FROM project WHERE id=$1;`;
  db.query(query, [projectId], function(err, result) {
    if (err) {
      callback(err);
    } else {
      if (result.rows.length > 0) {
        callback(null, result.rows[0]);
      } else {
        callback("No matching project id");
      }
    }
  });
};

exports.removeProjectById = function(projectId, callback) {
  var queryProject = `DELETE FROM project WHERE id=$1;`;
  db.query(queryProject, [projectId], function(err, result) {
    if (err) {
      callback(err);
    }
    console.log(result.rowCount);
    if (result.rowCount > 0) {
      callback(null);
    } else {
      callback("No matching project id");
    }
  });
};

// if user has registered profile, put this application info into database
exports.applyProject = function(pid, uid, callback) {
  // add member's application interest into project_application_relation table
  // the database has already checked uniqueness
  var query = `insert into project_application_relation (project_id, user_id) values($1,$2);`;
  db.query(query, [pid, uid], function(err, pid, uid) {
    if (err) {
      console.log(err);
      callback(err);
    }
    callback(null);
  });
};

// the project manager approves the application request
exports.approveApp = function(pid, uid, callback) {
  // when manager approves the application
  // add relation to project relation
  var query = `insert into project_relation (pid, uid, relation) values($1,$2,$3);`;
  var deletee = `delete from project_application_relation where project_id == $1 and user_id == $2`;
  db.query(query, [pid, uid, "Member"], function(err, pid, uid) {
    if (err) {
      console.log(err);
      callback(err);
    }
    // if insertion has no error, delete the relationship in application table
    db.query(deletee, [pid, uid], function(err) {
      if (err) {
        console.log(err);
        callback(err);
      }
      callback(null);
    });

    callback(null);
  });
};

// the project manager rejects the application request
exports.rejectApp = function(pid, uid, callback) {
  // the manager rejects the member's application
  // delete the applicaiton request
  var deletee = `delete from project_application_relation where project_id == $1 and user_id == $2`;
  db.query(deletee, [pid, uid], function(err, pid, uid) {
    if (err) {
      console.log(err);
      callback(err);
    }
    callback(null);
  });
};

// the manager can see all the applicants
exports.allApp = function(pid, callback) {
  // select all applicants of this project
  var query = `select * from project_relation where pid == $1`;
  db.query(query, [pid], function(err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      if (result.rows.length > 0) {
        callback(null, result);
      } else {
        callback("No matching project id");
      }
    }
  });
};
