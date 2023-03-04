import React,{ useEffect,useRef,useState } from 'react';
import { encode, decode,decodeAsync, decodeArrayStream, decodeMultiStream } from "@msgpack/msgpack";
import ConfigureClient from "./configureClient.js";


import useCookie from "./useCookie";

var default_ws_url = "ws://192.168.100.100/els";

export default function EspWS({set_ws,msg,set_msg,connected, set_connected, config}){
    //const [ws_connected,set_ws_connected] = useState(false);
    const ws = useRef(null);
    const [client_configured,set_client_configured] = useState(false);
    const [cookie,updateCookie] = useCookie("url", default_ws_url);
    //const [ws_url,set_ws_url] = useState("ws://192.168.1.41/");
    const [ws_url,set_ws_url] = useState(cookie);
    const [clients, set_clients] = useState([]);

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

        ws.current = new WebSocket(ws_url);
        set_ws(ws);
        
        ws.current.onopen = () => {
            console.log("ws opened"); ws.current.binaryType = 'blob'; set_connected(true);
            var outmsg = {cmd: "helo",vsn: config.vsn};
            ws.current.send(JSON.stringify(outmsg));
        }
        ws.current.onclose = () => {
            console.log("ws closed, trying to reconnect");
            set_connected( false);
            ws.current = new WebSocket(ws_url);
        }
        ws.current.onmessage = message => {
            if(message.data instanceof Blob){
                decodeFromBlob(message.data).then((x) => {
                    set_msg(x);
                });
            }
        };
        const wsCurrent = ws.current;

        return () => {
            ws.current.close();
        }
    },[ws_url]);

    return (
        <div id="espWS">
            
            { !client_configured && ConfigureClient(ws,ws_url,set_ws_url,config,connected,cookie,updateCookie)}
            Current Message { JSON.stringify(msg) }
        </div>
    )
}
