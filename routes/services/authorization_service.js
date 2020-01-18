const db = require('../../server/user_db');

exports.UserRole = {
    Root:"Root", Admin:"Admin", EventExecutive:"Event Executive", ProjectManager:"Project Manager", Finance:"Finance", Outreach:"Outreach"
};

exports.authorizationCheck = function(authorizedRole, uid, callback){
    db.getUserRoleByUid(uid, function(err, userRole){
        if(err){
            console.log(err);
            res.status(502).json({msg: err});
            return;
        }
        let intersection = authorizedRole.filter(x => userRole.includes(x));
        let result = intersection.length > 0;
        callback(result);
    });
};