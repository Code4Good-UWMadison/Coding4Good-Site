var self = this;
var pg = require("pg");
var config = require("./dbconfig.js");
var db = new pg.Pool(config.db);

exports.editProject = function(project, callback) {
  const query = `update project set title=$2, description=$3, contact=$4, org_name=$5, status=$6, project_link=$7, video_link=$8, applyable=$9 where project.id = $1;`;
  const oldLink = `DELETE FROM project_relation WHERE project_relation.pid = $1`;
  const newLink = `INSERT INTO project_relation(pid, uid, relation) values($1,$2,$3);`;
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
      project.video_link,
      project.applyable
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
      } else if (project.team != null && project.team.length > 0) {
        // make sure callback is only called after loop finish
        Promise.all(project.team.map(function(member) {
          return new Promise(function(resolve, reject){
            db.query(newLink, [project.id, parseInt(member.id), member.memberTitle], function(err) {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });
        })).then(function(){
          callback();
        }, function(err){
          console.log(err);
          callback(err);
        });
      } else {
        callback();
      }
    }
  );
};

exports.createProject = function(project, callback) {
  var query = `INSERT INTO project (title, description, contact, org_name, creation_time, status, project_link, video_link, applyable) 
              VALUES ($1,$2,$3,$4,(now() at time zone 'America/Chicago'),$5, $6, $7, $8) returning id;`;
  var link = `INSERT INTO project_relation(pid, uid, relation) VALUES ($1,$2,$3);`;
  db.query(
    query,
    [
      project.title,
      project.description,
      project.contact,
      project.org_name,
      project.status,
      project.project_link,
      project.video_link,
      project.applyable
    ],
    function(err, projectId) {
      if (err) {
        console.log(err);
        callback(err);
      } else if (project.team != null && project.team.length > 0) {
        // make sure callback is only called after loop finish
        Promise.all(project.team.map(function(member) {
          return new Promise(function(resolve, reject){
            db.query(link, [projectId.rows[0].id, parseInt(member.id), member.memberTitle], function(err) {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });
        })).then(function(){
          callback();
        }, function(err){
          console.log(err);
          callback(err);
        });
      } else {
        callback();
      }
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
  const queryProject = `DELETE FROM project WHERE id=$1;`;
  db.query(queryProject, [projectId], function(err, result) {
    if (err) {
      callback(err);
    }
    if (result.rowCount > 0) {
      callback(null);
    } else {
      callback("No matching project id");
    }
  });
};

// if user has registered profile, put this application info into database
exports.applyProject = function(project_id, uid, callback) {
  // add member's application interest into project_application_relation table
  // the database has already checked uniqueness
  var query = `INSERT INTO project_application_relation (project_id, user_id) VALUES($1,$2);`;
  db.query(query, [project_id, uid], function(err) {
    if (err) {
      console.log(err);
      callback(err);
    }
    callback(null);
  });
};

// the project manager approves the application request
exports.approveApplicant = function(project_id, uid, callback) {
  // when manager approves the application
  // add relation to project relation
  var query = `INSERT INTO project_relation (pid, uid, relation) VALUES($1,$2,$3);`;
  var remove = `DELETE FROM project_application_relation WHERE project_id = $1 AND user_id = $2`;
  db.query(query, [project_id, uid, "Member"], function(err) {
    if (err) {
      console.log(err);
      callback(err);
    }
    else{
      // if insertion has no error, delete the relationship in application table
      db.query(remove, [project_id, uid], function(err) {
        if (err) {
          console.log(err);
          callback(err);
        }
        else{
          callback(null);
        }
      });
    }
  });
};

// the project manager rejects the application request
exports.rejectApplicant = function(project_id, uid, callback) {
  // the manager rejects the member's application
  // delete the applicaiton request
  var remove = `DELETE FROM project_application_relation WHERE project_id = $1 AND user_id = $2`;
  db.query(remove, [project_id, uid], function(err, project_id, uid) {
    if (err) {
      console.log(err);
      callback(err);
    }
    callback(null);
  });
};

// the manager can see all the applicants
exports.getAllApplicantByProjectId = function(project_id, callback) {
  // select all applicants of this project
  var query = "SELECT * FROM project_application_relation r, users u WHERE u.id = r.user_id AND r.project_id = $1;";
  db.query(query, [project_id], function(err, result) {
    if (err) {
      console.log(err);
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

exports.getAppliedProjectByUserId = function (uid, callback) {
  const query = "SELECT * FROM project_application_relation AS r, project AS p WHERE r.user_id = $1 AND p.id = r.project_id;";
  db.query(query, [uid], function(err, result) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      if(result.rows.length > 0) {
        callback(null, result.rows);
      } else {
        callback(null, null);
      }
    }
  });
}