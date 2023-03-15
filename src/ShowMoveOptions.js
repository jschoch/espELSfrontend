import React, { Component, useState, useEffect,useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { send, mmToIn, inToMM, distanceToSteps,stepsToDistance, mmOrImp, viewPitch } from './util.js';
import MaxPitch from './MaxPitch.js';




export default function ShowMoveOptions({state,moveConfig,set_moveConfig, nvConfig,machineConfig}){
  const [move_pitch, set_move_pitch] = useState(moveConfig.movePitch);
  const [rapid_pitch, set_rapid_pitch] = useState(moveConfig.rapidPitch);
  const [distance, set_distance] = useState(0);
  const [dwell,set_dwell] = useState(0);
  const movePitchRef = useRef();
  const rapidPitchRef = useRef();
  const accelRef = useRef();

  const updateMoveConf = (data) =>{
    const p = movePitchRef.current.value;
    const rp = rapidPitchRef.current.value;
    console.log("updateMoveConfg",p,rp);
    var c = { 
      moveSteps: distanceToSteps(state,nvConfig, distance), 
      rapidPitch: rp, 
      pitchPitch: p, 
      dwell: dwell,
      accel: accelRef.current.value,
      f: true 
    };
    if(state.metric != "true"){
      c.rapidPitch = inToMM(rp);
      c.pitchPitch = inToMM(p);
    }
    //set_moveConfig(mc);
    var d = { cmd: "sendMoveConfig", config: c }
    send(d);
  }
    return(
        <div>
          <Row>
            <Col>
            <span>
              <MaxPitch 
                state={state}
                nvConfig={nvConfig} /> 

              {machineConfig.dbg &&
               <span> Current Pitch: {machineConfig.movePitch} Rapid: {machineConfig.rapidPitch} </span>}
            </span>
              <InputGroup className="mb-3">
                <FormControl
                  aria-label="Bounce Pitch"
                  //value={() => {viewPitch(moveConfig.movePitch)}}
                  placeholder={viewPitch(state,moveConfig.movePitch)}
                  inputMode='numeric' step='any' type="number"
                  defaultValue={viewPitch(state,moveConfig.movePitch)}
                  ref={movePitchRef}
                />
                <InputGroup.Text id="unf">
                  {mmOrImp(state)}
                  Move Pitch</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mb-1">
                <FormControl
                  aria-label="Rapid Pitch"
                  placeholder={viewPitch(state,moveConfig.rapidPitch)}
                  inputMode='numeric' step='any' type="number"
                  defaultValue={viewPitch(state,moveConfig.rapidPitch)}
                  ref={rapidPitchRef}
                />
                <InputGroup.Text id="rp">
                  {mmOrImp(state)}
                  Rapid Pitch
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mb-1">
                <FormControl
                  aria-label="Rapid Pitch"
                  inputMode='numeric' step='any' type="number"
                  defaultValue={200000}
                  ref={accelRef}
                />
                <InputGroup.Text id="rp">
                  Acceleration steps/s2
                </InputGroup.Text>
              </InputGroup>
              <Button onClick={updateMoveConf} >
                Update Pitch Settings
              </Button>
            </Col>
          </Row>


        </div>
    )

}
