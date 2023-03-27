import React, { useEffect, useRef, useState } from 'react';
import { Form, InputGroup, Col, Grid, Row, Button } from 'react-bootstrap';


export default function ConfigureClient(set_ws_url,  connected, cookie, setCookie,sse_source) {

    const [submitConnecting,set_submitConnecting] = useState(false);
    const ip_or_hostnameRef = useRef();


    const handleSubmit = (e) => {

        e.preventDefault();
       
        var cv = ip_or_hostnameRef.current.value
        var this_ws_url = "ws://"+cv+"/els"
        var this_events_url = "http://"+cv+"/events"
        //source.open
        set_ws_url(this_ws_url);
        var x = setCookie("ip_or_hostname",cv);
        console.log("updating cookie: x",x,cv)
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
