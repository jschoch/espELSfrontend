

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

export function distanceToSteps(nvConfig,distance) {
    var r = 0; 
    if (nvConfig.metric == "true") {
       r = distance * stepsPerMM(nvConfig);
    } else {
        r = distance * stepsPerIn(nvConfig);
    }

    r = Math.floor( r);

    if(Number.isSafeInteger(r) ){
        return r
    } else
    {
        alert("Invalid Distance error");
        console.log("invalid distance conversion", r, distance, nvConfig);
        return 0
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
    return nvConfig.motor_steps / nvConfig.lead_screw_pitch;
}

export function mmToIn(val){
    return (val / 25.4).toFixed(4)
}

export function inToMM(val){
    return val * 25.4;
}

export function maxPitch(nvConfig){
    var maxSteps =  (nvConfig.spindle_encoder_resolution * nvConfig.lead_screw_pitch)
  
    return stepsToDistance(nvConfig,maxSteps);
}



export function stepsToDistance(nvConfig, steps) {
    var r = 0;
    if (!nvConfig ) {
        console.log("wtf",nvConfig);
        return 0;
    }
    
    if (nvConfig.metric == "true") {
        r = steps / stepsPerMM(nvConfig);
        //console.log("stepstoDistance" ,stepsPerMM,r);
    }else{

        r = steps / stepsPerIn(nvConfig) ;
        //console.log("steps",r);
    }
    if( r !== undefined || !isNaN(r)){
        return r;

    }else{
        //alert("invalid steps conversion");
        console.log("invalid steps conversion",nvConfig,steps)
        return 0;
    }
}
