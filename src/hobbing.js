import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { ArrowBarLeft, ArrowLeft, ArrowRight,ArrowBarRight } from 'react-bootstrap-icons';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


export default function Hobbing({config,setConfig,me,ws,stats,jogcancel}){
    // feedingLeft is the feed direciton CW/CCW
    const [feedingLeft,set_feedingLeft] = useState(true);
    const [hobconfig, set_hobconfig] = useState({pitch: config.pitch, mode: config.m})
    const [syncStart, set_syncStart] = useState(true);

    function set_pitch(v){
        var c = config;
        c.pitch = v;
        setConfig(c);
        console.log("hob got ",v);
    }
    function handleStart(){
        console.log("hob start clicked");
        var c = config;
        c.f = feedingLeft;
        c.s = syncStart;
        var d = {cmd: "hobrun",config: c}
        console.log("hob ws",d,ws);
        ws.send(JSON.stringify(d));
    }
    function handleStop(){
        console.log("hob start clicked");
        var c = config;
        var d = {cmd: "hobstop",config: c}
        ws.send(JSON.stringify(d));
    }

    return(
        <div>
            <Row>
                Hobbing
            </Row>
            <Row>
                <Col>
                Set Tooth Count
                    <InputGroup className="mb-3">
                        <FormControl
                        placeholder="Gear teeth"
                        aria-label="Gear teeth"
                        value={hobconfig.pitch}
                        inputMode='integer' step='any' type="number"
                        onChange={e => set_pitch(e.target.value)}
                        />
                    <InputGroup.Text id="hobinput">Set Gear Tooth Count</InputGroup.Text>
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Button variant="primary" onClick={handleStart} disabled={config.m != 9}>Start</Button>
                <Button variant="primary" onClick={handleStop} disabled={false}>Stop</Button>
                mode { config.m }
            </Row>
            
        </div>
    )
}
