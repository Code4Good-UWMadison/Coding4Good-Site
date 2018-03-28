
var StatusEnum = Object.freeze({
    Starting:0, InProgress:1, OnHold:2, Succeed:3, Failed:4, Maintaining:5
});

function enumExchange(dbEnum){
    if(dbEnum=="Starting"){
        return StatusEnum.Starting;
    }
    else if(dbEnum=="In Progress"){
        return StatusEnum.InProgress;
    }
    else if(dbEnum=="On Hold"){
        return StatusEnum.OnHold;
    }
    else if(dbEnum=="Succeed"){
        return StatusEnum.Succeed;
    }
    else if(dbEnum=="Failed"){
        return StatusEnum.Failed;
    }
    else if(dbEnum=="Maintaining"){
        return StatusEnum.Maintaining;
    }
}