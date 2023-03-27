import ConfigureClient from "./configureClient"
import useCookie from "./useCookie";
import  { useEffect, useRef, useState } from 'react';


export default function Network({state,ws_url,set_ws_url,cookie,setCookie}){
    const [client_configured, set_client_configured] = useState(false);

    return(
        <div>
            Network show
            <div id="espWS">

            {!client_configured && ConfigureClient( set_ws_url,  state.connected, cookie, setCookie)}
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
