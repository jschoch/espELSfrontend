

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
    var stepsPerMM = nvConfig.motor_steps / nvConfig.lead_screw_pitch;
    if (nvConfig.metric == "true") {
        return distance * stepsPerMM;
    } else {
        return distance * stepsPerMM * 25.4;
    }
}

export function stepsToDistance(nvConfig, steps, mm = true) {
    if (!nvConfig ) {
        console.log("wtf",nvConfig);
        return 0;
    }
    var stepsPerMM = nvConfig.motor_steps * nvConfig.lead_screw_pitch;
    if (nvConfig.metric == "true") {
        var r = steps / stepsPerMM;
        //console.log("stepstoDistance" ,stepsPerMM,r);
        return r;
    }else{
        var r = steps / (stepsPerMM * 25.4);
        //console.log("steps",r);
        return r;
    }
}
