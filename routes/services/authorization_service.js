const db = require('../../server/user_db');

exports.UserRole = {
    Root:"Root", Developer: "Developer", Admin:"Admin", EventExecutive:"Event Executive", ProjectManager:"Project Manager", ProjectLeader:"Project Leader", ProjectMember:"Project Member", Finance:"Finance", Outreach:"Outreach"
};

// check if user has role in authrizedRole
// authorizedRole: Array of role that is authorized to access this page, null means check login
// uid: user id to check access
exports.authorizationCheck = function(authorizedRole, uid, callback){
    if(!uid){
        callback(null, false);
    }
    else if(authorizedRole == null){
        callback(null, true);
    }
    else{
        authorizedRole.push(this.UserRole.Root);
        db.getUserRoleByUid(uid, function(err, userRole){
            if(err){
                console.log(err);
                callback(err);
            }
            else if(!userRole){
                callback(null, false);
            }
            else{
                let intersection = userRole.filter(x => authorizedRole.includes(x.user_role));
                let authorized = intersection.length > 0;
                callback(null, authorized);
            }
        });
    }
};