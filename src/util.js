

export function send(cmd){
    if(window.wsclient && window.wsclient.readyState === 1){
        console.log("Sending cmd:",cmd)
        var json = JSON.stringify(cmd);
        window.wsclient.send(json);
    }else{
        alert("not connected");
    }
}
