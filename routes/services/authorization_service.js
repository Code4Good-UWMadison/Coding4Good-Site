const db = require('../../server/user_db');

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