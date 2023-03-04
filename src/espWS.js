import React,{ useEffect,useRef,useState } from 'react';
import { encode, decode,decodeAsync, decodeArrayStream, decodeMultiStream } from "@msgpack/msgpack";
import ConfigureClient from "./configureClient.js";


import useCookie from "./useCookie";

var default_ws_url = "ws://192.168.100.100/els";

export default function EspWS({msg,set_msg,connected, set_connected, config}){
    //const [ws_connected,set_ws_connected] = useState(false);
    const ws = useRef(null);
    const [client_configured,set_client_configured] = useState(false);
    const [cookie,updateCookie] = useCookie("url", default_ws_url);
    //const [ws_url,set_ws_url] = useState("ws://192.168.1.41/");
    const [ws_url,set_ws_url] = useState(cookie);
    const [clients, set_clients] = useState([]);
    const [waitingToReconnect, setWaitingToReconnect] = useState(null);

    async function decodeFromBlob(blob: Blob): unknown {
        if (blob.stream) {
          //console.log("stream");
          return await decodeAsync(blob.stream());
        } else {
          // Blob#arrayBuffer(): Promise<ArrayBuffer> (if stream() is not available)
          return decode(await blob.arrayBuffer());
        }
      }


    useEffect(() => {
        console.log("the ru",ws_url)
        if(ws_url === default_ws_url || ws_url == undefined){
            return;
        }
        if(ws_url == 'undefined' || ws_url == 0 || typeof(ws_url) == "undefined"){
            console.log("javasscript is the worst",ws_url, cookie)
            return;
        }

        if(ws.current && ws.current.readyState == 3){
            console.log("lalalallalalala");
        } 
       
        if(!ws.current || ws.current.borked){
            ws.current = new WebSocket(ws_url);
            // maybe this is better?
            window.wsclient = ws.current;

            ws.current.onopen = () => {
                console.log("ws opened"); ws.current.binaryType = 'blob'; set_connected(true);
                var outmsg = {cmd: "helo",vsn: config.vsn};
                ws.current.send(JSON.stringify(outmsg));
            }
            ws.current.onclose = () => {
                set_connected( false);
                if(waitingToReconnect) {
                    console.log("r.");
                    return;
                }
                if(ws.current){
                    console.log("server closed ws , trying to reconnect");
                }else{
                    console.log("ws closed by unmount");
                    return;
                }
                console.log("setting timeout to reconnect, why doesn't this fucking work!!!!");
                setWaitingToReconnect(true);
                setTimeout( () => {
                    console.log("boom",ws.current);
                    setWaitingToReconnect(null);
                    ws.current.borked = true;
                    alert("reconnection is broken refresh asshole");
                } , 1000);
            }
            ws.current.onmessage = message => {
                if(message.data instanceof Blob){
                    decodeFromBlob(message.data).then((x) => {
                        set_msg(x);
                    });
                }
            };
        }

        return () => {
            ws.current.close();
        }
    },[ws_url,ws]);

    return (
        <div id="espWS">
            
            { !client_configured && ConfigureClient(ws,ws_url,set_ws_url,config,connected,cookie,updateCookie)}
            Current Message { JSON.stringify(msg) }
        </div>
    )
}
