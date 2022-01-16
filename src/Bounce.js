
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function Bounce({ws}){
    const [jog_mm,set_jog_mm] = useState(0);
    const [jog_pitch, set_jog_pitch] = useState(0.1);
    const [rapid_pitch, set_rapid_pitch] = useState(1);

    function bounce(distance){
        var c = {jog_mm: jog_mm,rapid: rapid_pitch,pitch: jog_pitch,f: true};
        var d = {cmd: "bounce",config: c}
        console.log("jog ws",d,ws);
        ws.send(JSON.stringify(d));
    }

  return(
    <div>
      <Button variant="dark" className="btn-block" > Bounce Settings</Button>
      <Row>
          <Col>
          <span> Set positive for Z+ negative for Z- TODO: is this an issue with number chooser on phone?</span>
          <InputGroup className="mb-3">
                <FormControl
                placeholder="Distance to Jog"
                aria-label="Distance to Jog"
                aria-describedby="basic-addon2"
                value={jog_mm}
                inputMode='decimal' step='any' type="number"
                onChange={e => set_jog_mm(e.target.value)}
                />
                <InputGroup.Text id="notsure">(mm) Jog Distance</InputGroup.Text>
            </InputGroup> 
          </Col>
          </Row>
          <Row>
          <Col>
          <InputGroup className="mb-3">
                <FormControl
                placeholder="Jog Pitch"
                aria-label="Jog Pitch"
                aria-describedby="basic-addon2"
                value={jog_pitch}
                inputMode='decimal' step='any' type="number"
                onChange={e => set_jog_pitch(e.target.value)}
                />
                <InputGroup.Text >Jog Pitch</InputGroup.Text>
            </InputGroup> 
          </Col>
        </Row>
        <Row>  

          <Col>
          <FormControl
                placeholder="Rapid Pitch"
                aria-label="Rapid Pitch"
                aria-describedby="basic-addon2"
                value={rapid_pitch}
                inputMode='decimal' step='any' type="number"
                onChange={e => set_rapid_pitch(e.target.value)}
                />
                <InputGroup.Text >Rapid Pitch</InputGroup.Text> 
          </Col>
          </Row>
      <Button className="btn-block" onClick={() => bounce()}>Run Bounce</Button>
    </div>
    )
}