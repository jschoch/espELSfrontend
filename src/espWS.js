import React, { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { encode, decode, decodeAsync, decodeArrayStream, decodeMultiStream } from "@msgpack/msgpack";
import ConfigureClient from "./configureClient.js";


import useCookie from "./useCookie";
import { send } from './util.js';



export default function EspWS({ ws_url, set_msg, connected, set_connected, vsn, set_ws_url,ip,sse_source,set_sse_source,set_sse_events,cookies }) {
  //const [ws_connected,set_ws_connected] = useState(false);
  const ws = useRef(null);



  const [clients, set_clients] = useState([]);
  const [waitingToReconnect, setWaitingToReconnect] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  //async function decodeFromBlob(blob: Blob): unknown {
  async function decodeFromBlob(blob) {
    if (blob.stream) {
      //console.log("stream");
      return await decodeAsync(blob.stream());
    } else {
      // Blob#arrayBuffer(): Promise<ArrayBuffer> (if stream() is not available)
      return decode(await blob.arrayBuffer());
    }
  }
  const ping = { cmd: "ping" };
  /*  TODO: is this needed?
  useEffect(() => {
    const interval = setInterval(() => {
      send(ping);
    }, 2000);
    return () => clearInterval(interval);
  }, [connected])

  */


  useEffect(() => {

    if (waitingToReconnect) {
      console.log("waiting for reconnection");
      return;
    }

    if (ws_url == "ws://undefined/els") {
      console.log("ws not configured");
      return;
    }

    // Only set up the websocket once
    if (!ws.current && ws_url) {
      console.log("setting up websocket", ws_url);
      const client = new WebSocket(ws_url);
      ws.current = client;

      window.wsclient = client;

      client.onerror = (e) => console.error(e);

      client.onopen = () => {
        setIsOpen(true);
        set_connected(true);
        console.log('ws opened');
        var outmsg = { cmd: "helo", vsn: vsn };
        send(outmsg);

        // setup SSE
        var url = "http://" + ip + "/events";
        if (url != "http://undefined/events") {
          //var source = new EventSourcePolyfill(url,headers);
          var source = new EventSource(url);
          set_sse_source(source);
          set_ws_url("ws://" + cookies.ip_or_hostname + "/els")
          console.log("ws url updated to: ", ws_url);

          source.onopen = () => {
            console.log("eventsource opened");
          }

          source.onmessage = function logEvents(event) {
            var d = "";
            //console.log("bah", event);
            try {
              d = JSON.parse(event.data);
              //console.log("Event: ",d,source);
              //updateData(d);
              set_sse_events(d);
            } catch (e) {
              console.log("non json event", event)
            }
          }
        }
        else {
          console.log("SSE url not initialized yet");
        }
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
        if(sse_source != null && sse_source != undefined){
          console.log("sse source closing");
          sse_source.close();
        }else{
          console.log("sse source gone");
        }
        

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
        console.log("blorp",message);
        if (message.data instanceof Blob) {
          decodeFromBlob(message.data).then((x) => {
            //console.log("blob",x);
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

  }, [waitingToReconnect, ws_url, set_ws_url]);



  return (
    <div></div>
  )
}
