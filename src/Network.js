import ConfigureClient from "./configureClient"
import useCookie from "./useCookie";
import  { useEffect, useRef, useState } from 'react';


export default function Network({state,connected,ws_url,set_ws_url,cookie,setCookie,set_sse_source}){

    return(
        <div>
            Network Configuraiton {state.connected}
            {connected &&
            <h3>
            {JSON.stringify(cookie)} Connected
            </h3>
            }
            <div id="espWS">

            {ConfigureClient( set_ws_url,set_sse_source,  state.connected, cookie, setCookie)}
            <div style={state.dbg ? {} : {display: 'none'}}>
            <span>
                ws_url {ws_url}
            </span>
            <br />
            
            </div>
        </div>
        </div>

    )
}
