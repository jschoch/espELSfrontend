import React, { useEffect, useRef, useState } from 'react';
import { Form, InputGroup, Col, Grid, Row, Button } from 'react-bootstrap';


export default function ConfigureClient(set_ws_url,  connected, cookie, updateCookie) {

    const [thisurl, set_thisurl] = useState(cookie);
    const [submitConnecting,set_submitCOnnecting] = useState(false);


    const handleSubmit = (e) => {

        e.preventDefault();
        console.log("network submitted", thisurl);
        set_ws_url(thisurl);
        updateCookie(thisurl, 1000);
        set_submitCOnnecting(true);
    };
    const onChangeHandler = event => {
        set_thisurl(event.target.value);
    };




    return (
        <div>
            { !submitConnecting && 
            <div>
            <Form onSubmit={handleSubmit}>

                <label htmlFor="url">example: ws://192.168.0.100/els </label>
                <input  className="form-control" type="text"
                    name="url"
                    onChange={onChangeHandler}
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
