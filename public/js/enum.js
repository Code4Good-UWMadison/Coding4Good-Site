
var StatusEnum = Object.freeze({
    Starting:0, InProgress:1, OnHold:2, Succeed:3, Failed:4, Maintaining:5
});

var UserRoleEnum = Object.freeze({
    Root:0, Admin:1, EventExecutive:2, ProjectManager:3, Finance:4, Outreach:5
});

var TypeEnum = Object.freeze({
    statusEnum:0, userRoleEnum:1
});

function statusEnumExchange(statusType){
    if(statusType=="Starting"){
        return StatusEnum.Starting;
    }
    else if(statusType=="In Progress"){
        return StatusEnum.InProgress;
    }
    else if(statusType=="On Hold"){
        return StatusEnum.OnHold;
    }
    else if(statusType=="Succeed"){
        return StatusEnum.Succeed;
    }
    else if(statusType=="Failed"){
        return StatusEnum.Failed;
    }
    else if(statusType=="Maintaining"){
        return StatusEnum.Maintaining;
    }
    return null;
}

function userRoleEnumExchange(statusType){
    if(statusType=="Root"){
        return UserRoleEnum.Root;
    }
    else if(statusType=="Admin"){
        return UserRoleEnum.Admin;
    }
    else if(statusType=="Event Executive"){
        return UserRoleEnum.EventExecutive;
    }
    else if(statusType=="Project Manager"){
        return UserRoleEnum.ProjectManager;
    }
    else if(statusType=="Finance"){
        return UserRoleEnum.Finance;
    }
    else if(statusType=="Outreach"){
        return UserRoleEnum.Outreach;
    }
    return null;
}

function enumExchange(enumType, dbEnum){
    if(enumType==TypeEnum.statusEnum){
        return statusEnumExchange(dbEnum);
    }
    else if(enumType==TypeEnum.userRoleEnum){
        return userRoleEnumExchange(dbEnum);
    }
    return null;
}