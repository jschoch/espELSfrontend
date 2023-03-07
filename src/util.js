

export function send(cmd) {
    if (window.wsclient && window.wsclient.readyState === 1) {
        if(cmd.cmd && cmd.cmd != "ping"){
            console.log("Sending cmd:", cmd)
        }
        
        var json = JSON.stringify(cmd);
        window.wsclient.send(json);
    } else {
        //alert("not connected");
        console.log("not connected");
    }
}

export function distanceToSteps(nvConfig, distance, mm = true) {
    if (mm) {
        var stepsPerMM = nvConfig.motor_steps * nvConfig.lead_screw_pitch;
        return distance * stepsPerMM;
    } else {

    }
    return distance * nvConfig.conversion;

}

export function stepsToDistance(nvConfig, steps, mm = true) {
    if (!nvConfig) {
        //console.log("wtf");
        return 0;
    }
    if (mm) {
        var stepsPerMM = nvConfig.motor_steps * nvConfig.lead_screw_pitch;
        var r = steps / stepsPerMM;
        //console.log("stepstoDistance" ,stepsPerMM,r);
        return r;
    }
}
