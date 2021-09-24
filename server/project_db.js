var update_profile=require("./user_db").updateProfile;
var self = this;
var pg = require("pg");
var config = require("./dbconfig.js");
var db = new pg.Pool(config.db);

exports.editProject = async (project) => {
    const query = `update project set title=$2, description=$3, contact=$4, org_name=$5, status=$6, project_link=$7, video_link=$8, applyable=$9 where project.id = $1;`;
    const oldLink = `DELETE FROM user_role WHERE user_role.associated_project_id = $1`;
    const newLink = `INSERT INTO user_role(associated_project_id, user_id, user_role) values($1,$2,$3);`;
    const client = await db.connect();
    try{
        await client.query("BEGIN");
        await client.query(query, [
            project.id,
            project.title,
            project.description,
            project.contact,
            project.org_name,
            project.status,
            project.project_link,
            project.video_link,
            project.applyable
        ]);
        await client.query(oldLink, [project.id]);
        for (var i = 0; i < project.team.length; i++){
            await client.query(newLink, [project.id, parseInt(project.team[i].id), project.team[i].user_role]);
        }
        await client.query("COMMIT");
    }catch(err){
        await client.query('ROLLBACK');
        throw err;
    }finally{
      client.release(); 
    }
};

exports.createProject = async (project) => {
    let query = `INSERT INTO project (title, description, contact, org_name, creation_time, status, project_link, video_link, applyable) 
                VALUES ($1,$2,$3,$4,(now() at time zone 'America/Chicago'),$5, $6, $7, $8) returning id;`;
    let link = `INSERT INTO user_role(associated_project_id, user_id, user_role) VALUES ($1,$2,$3);`;
    
    const client = await db.connect();
    try{
        await client.query('BEGIN');
        var projectId = await client.query(query, [
            project.title,
            project.description,
            project.contact,
            project.org_name,
            project.status,
            project.project_link,
            project.video_link,
            project.applyable
        ]);
       
        for (var i = 0; i < project.team.length; i++){
            await client.query(link, [projectId.rows[0].id, parseInt(project.team[i].id), project.team[i].user_role]);
        }
        await client.query('COMMIT');
        return projectId.rows[0].id;
    } catch(err){
        await client.query('ROLLBACK');
        throw err;
    } finally{
        client.release();
    }
   
};

exports.getProjectSet = function (callback) {
    var query = `SELECT * FROM project;`;
    db.query(query, function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result.rows);
        }
    });
};

exports.getAssociatedProjectsByUserId = function (user_id, callback) {
    var query = `SELECT p.id, p.title, p.org_name, p.status, r.user_role 
                FROM user_role r, users u, project p 
                WHERE u.id = r.user_id AND u.id = $1 AND p.id = r.associated_project_id`;
    db.query(query, [user_id], function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result.rows);
        }
    });
};

exports.getAssociatedUsersByProjectId = function (projectId, callback) {
    var query = `SELECT u.name AS name, r.user_role, u.id AS uid, u.email AS email 
                FROM user_role r, users u, project p 
                WHERE u.id = r.user_id AND p.id = $1 AND p.id = r.associated_project_id`;
    db.query(query, [projectId], function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result.rows);
        }
    });
};

exports.getProjectById = function (projectId, callback) {
    var query = `SELECT * FROM project WHERE id=$1;`;
    db.query(query, [projectId], function (err, result) {
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

exports.removeProjectById = function (projectId, callback) {
    const queryProject = `DELETE FROM project WHERE id=$1;`;
    db.query(queryProject, [projectId], function (err, result) {
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
exports.applyProject = function (profile, user_id, callback) {
    const {year,intended_teamleader,contribution,active_participation,reason,project_id,time_for_project,interests}=profile;
    // add member's application interest into project_application_relation table
    // the database has already checked uniqueness
    const query = `INSERT INTO project_application_relation (project_id, user_id,intended_teamleader,reason,contribution,active_participation,interests,time_for_project,application_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now() at time zone 'America/Chicago');`;
    db.query(query, [project_id, user_id,intended_teamleader,reason,contribution,active_participation,interests,time_for_project], function (err) {
        if (err) {
            callback(err);
        }
        else {
            update_profile(user_id,{year},function(err){
                if(err)
                callback(err);
                else
                callback(null);})
        }
    });
 };
 

// check if a user has applied to the project
exports.checkApplied = function (project_id, user_id, callback) {
    const query = `SELECT * FROM project_application_relation WHERE project_id = $1 AND user_id = $2;`;
    db.query(query, [project_id, user_id], function (err, result) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            callback(null, result.rowCount > 0);
        }
    })
}

// the project manager approves the application request
exports.approveApplicant = async (project_id, user_id, user_role) => {
    // when manager approves the application
    // add relation to project relation
    const query = `INSERT INTO user_role (associated_project_id, user_id, user_role) VALUES($1,$2,$3);`;
    const remove = `DELETE FROM project_application_relation WHERE project_id = $1 AND user_id = $2`;
    const client = await db.connect();
    try{
        await client.query('BEGIN');
        await client.query(query, [project_id, user_id, user_role]);
        await client.query(remove, [project_id, user_id]);
        await client.query('COMMIT');
    } catch (err){
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// the project manager rejects the application request
exports.rejectApplicant = function (project_id, user_id, callback) {
    // the manager rejects the member's application
    // delete the applicaiton request
    const remove = `DELETE FROM project_application_relation WHERE project_id = $1 AND user_id = $2`;
    db.query(remove, [project_id, user_id], function (err) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            callback(null);
        }
    });
};

// the manager can see all the applicants
exports.getAllApplicantByProjectId = function (project_id, callback) {
    // select all applicants of this project
    const query = `SELECT u.id AS user_id, u.name, u.email, r.intended_teamleader,r.reason,r.contribution,r.active_participation,r.interests,r.time_for_project,r.application_date,
    (CASE WHEN u.id IN
        (SELECT DISTINCT user_id FROM user_role
        WHERE associated_project_id IS NOT NULL)
    THEN True ELSE False END) AS has_project
    FROM project_application_relation AS r, users AS u, user_profile AS p
    WHERE u.id = r.user_id AND r.project_id = $1 AND p.uid = u.id`;
    db.query(query, [project_id], function (err, result) {
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

exports.getAppliedProjectByUserId = function (user_id, callback) {
    const query = "SELECT * FROM project_application_relation AS r, project AS p WHERE r.user_id = $1 AND p.id = r.project_id;";
    db.query(query, [user_id], function (err, result) {
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
}