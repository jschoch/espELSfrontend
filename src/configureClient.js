import React, { useEffect, useRef, useState } from 'react';
import { Form, InputGroup, Col, Grid, Row, Button } from 'react-bootstrap';
//import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';


export default function ConfigureClient(set_ws_url,set_sse_source,  connected, cookie, setCookie,sse_source) {

    const [submitConnecting,set_submitConnecting] = useState(false);
    const ip_or_hostnameRef = useRef("please_enter_the_ip_of_the_espels");


    const handleSubmit = (e) => {

        e.preventDefault();
       
        var cv = ip_or_hostnameRef.current.value
        var this_ws_url = "ws://"+cv+"/els"
        var this_events_url = "http://"+cv+"/events"
        //source.open
        //let source = new EventSource(this_events_url)
        //var headers = {headers: {'Access-Control-Request-Private-Network': 'true'}}
        //var source = new EventSourcePolyfill(this_events_url, headers);
        //set_sse_source(source);
        //set_ws_url(this_ws_url);
        setCookie("ip_or_hostname",cv);
        console.log("updating cookie: ",cookie,cv)
        console.log("network submitted", cv);
        set_submitConnecting(true);
    };




    return (
        <div>
            { !submitConnecting && 
            <div>
            <Form onSubmit={handleSubmit}>

                <label htmlFor="url">Enter Hostname or IP example: 192.168.0.100</label>
                <input  className="form-control" type="text"
                    name="url"
                    //onChange={onChangeHandler}
                    ref={ip_or_hostnameRef}
                    defaultValue={cookie} />
                <br />
                <Button type="submit">Submit Connection Url</Button>

            </Form>
            </div>
            }
            { submitConnecting && !connected &&

                <div>
                    <h1> Connecting </h1>
                </div>
            }


        </div>
    );
}
