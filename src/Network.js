import ConfigureClient from "./configureClient"
import useCookie from "./useCookie";
import  { useEffect, useRef, useState } from 'react';


export default function Network({machineConfig,state,ws_url,set_ws_url,cookie,updateCookie}){
    const [client_configured, set_client_configured] = useState(false);

    return(
        <div>
            Network show
            <div id="espWS">

            {!client_configured && ConfigureClient( set_ws_url,  state.connected, cookie, updateCookie)}
            <div style={state.dbg ? {} : {display: 'none'}}>
            <span>
                {JSON.stringify(cookie)}
                ws_url {ws_url}
            </span>
            <br />
            
            </div>
        </div>
        </div>

    )
}
