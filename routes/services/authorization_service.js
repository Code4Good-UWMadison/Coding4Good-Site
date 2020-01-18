const db = require('../../server/user_db');

exports.UserRole = {
    Root:"Root", Admin:"Admin", EventExecutive:"Event Executive", ProjectManager:"Project Manager", ProjectLeader:"Project Leader", ProjectMember:"Project Member", Finance:"Finance", Outreach:"Outreach"
};

exports.authorizationCheck = function(authorizedRole, uid, callback){
    if(!uid){
        callback(null, false);
    }
    else if(authorizedRole == null){
        callback(null, true);
    }
    else{
        db.getUserRoleByUid(uid, function(err, userRole){
            if(err){
                console.log(err);
                callback(err);
            }
            let intersection = userRole.filter(x => authorizedRole.includes(x.user_role));
            let authorized = intersection.length > 0;
            callback(null, authorized);
        });
    }
};