

export function send(cmd) {
    if (window.wsclient && window.wsclient.readyState === 1) {
        //if(cmd.cmd && cmd.cmd != "ping"){
            console.log("Sending cmd:", cmd)
        //}
        
        var json = JSON.stringify(cmd);
        window.wsclient.send(json);
    } else {
        //alert("not connected");
        console.log("not connected");
    }
}

export function distanceToSteps(nvConfig,distance) {
    
    if (nvConfig.metric == "true") {
        return distance * stepsPerMM(nvConfig);
    } else {
        return distance * stepsPerIn(nvConfig);
    }
}

export function mmOrImp(nvConfig){
    if(nvConfig.metric == "true"){
        return "(mm)";
    }else{
        return "(in)";
    }
}

export function stepsPerIn(nvConfig){
    return stepsPerMM(nvConfig) * 25.4;
}

export function stepsPerMM(nvConfig){
    return nvConfig.motor_steps * nvConfig.lead_screw_pitch;
}

export function mmToIn(val){
    return (val / 25.4).toFixed(4)
}



export function stepsToDistance(nvConfig, steps) {
    if (!nvConfig ) {
        console.log("wtf",nvConfig);
        return 0;
    }
    
    if (nvConfig.metric == "true") {
        var stepsPerMM = stepsPerMM(nvConfig); 
        var r = steps / stepsPerMM;
        //console.log("stepstoDistance" ,stepsPerMM,r);
        return r;
    }else{

        var r = steps / stepsPerIn(nvConfig) ;
        //console.log("steps",r);
        return r;
    }
}
