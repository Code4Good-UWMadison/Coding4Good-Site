var StatusEnum = Object.freeze({
    Starting:0, InProgress:1, OnHold:2, Succeed:3, Failed:4, Maintaining:5
});

var UserRole = {
    Root:"Root", Admin:"Admin", EventExecutive:"Event Executive", ProjectManager:"Project Manager", Finance:"Finance", Outreach:"Outreach"
};

var TypeEnum = Object.freeze({
    statusEnum:0
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

function enumExchange(enumType, dbEnum){
    if(enumType==TypeEnum.statusEnum){
        return statusEnumExchange(dbEnum);
    }
    return null;
}