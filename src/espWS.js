import React, { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { encode, decode, decodeAsync, decodeArrayStream, decodeMultiStream } from "@msgpack/msgpack";
import ConfigureClient from "./configureClient.js";


import useCookie from "./useCookie";
import { send } from './util.js';

var default_ws_url = "ws://192.168.100.100/els";

export default function EspWS({ msg, set_msg, connected, set_connected, config,vsn }) {
    //const [ws_connected,set_ws_connected] = useState(false);
    const ws = useRef(null);
    const [client_configured, set_client_configured] = useState(false);
    const [cookie, updateCookie] = useCookie("url", default_ws_url);
    //const [ws_url,set_ws_url] = useState("ws://192.168.1.41/");
    const [ws_url, set_ws_url] = useState(cookie);
    const [clients, set_clients] = useState([]);
    const [waitingToReconnect, setWaitingToReconnect] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    async function decodeFromBlob(blob: Blob): unknown {
        if (blob.stream) {
            //console.log("stream");
            return await decodeAsync(blob.stream());
        } else {
            // Blob#arrayBuffer(): Promise<ArrayBuffer> (if stream() is not available)
            return decode(await blob.arrayBuffer());
        }
    }
    const ping = {cmd: "ping"};
    useEffect( () => {
        const interval = setInterval(() => {
            send(ping);
        },1000);
        return () => clearInterval(interval);
    },[connected])

    useEffect(() => {

        if (waitingToReconnect) {
          return;
        }
    
        // Only set up the websocket once
        if (!ws.current) {
          const client = new WebSocket(ws_url);
          ws.current = client;
    
          window.wsclient = client;
    
          client.onerror = (e) => console.error(e);
    
          client.onopen = () => {
            setIsOpen(true);
            set_connected(true);
            console.log('ws opened');
            var outmsg = { cmd: "helo", vsn: vsn };
            //ws.current.send(JSON.stringify(outmsg));
            send(outmsg);
          };
    
          client.onclose = () => {
    
            if (ws.current) {
              // Connection failed
              console.log('ws closed by server');
            } else {
              // Cleanup initiated from app side, can return here, to not attempt a reconnect
              console.log('ws closed by app component unmount');
              return;
            }
    
            if (waitingToReconnect) {
              return;
            };
    
            // Parse event code and log
            setIsOpen(false);
            console.log('ws closed');
    
            // Setting this will trigger a re-run of the effect,
            // cleaning up the current websocket, but not setting
            // up a new one right away
            setWaitingToReconnect(true);
    
            // This will trigger another re-run, and because it is false,
            // the socket will be set up again
            setTimeout(() => setWaitingToReconnect(null), 500);
          };
    
          client.onmessage = message => {
            if (message.data instanceof Blob) {
                decodeFromBlob(message.data).then((x) => {
                    set_msg(x);
                });
            }
          };
    
    
          return () => {
    
            console.log('Cleanup');
            set_connected(false);
            // Dereference, so it will set up next time
            ws.current = null;
    
            client.close();
          }
        }
    
      }, [waitingToReconnect]);



    return (
        <div id="espWS">

            {!client_configured && ConfigureClient(ws, ws_url, set_ws_url, config, connected, cookie, updateCookie)}
            <div style={config.dbg ? {} : {display: 'none'}}>
            <span>
                {JSON.stringify(cookie)}
                ws_url {ws_url}
            </span>
            <br />
            <span>
            Current Message {JSON.stringify(msg)}
            </span>
            
            </div>
        </div>
    )
}
