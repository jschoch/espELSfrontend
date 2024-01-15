import  { useState, useEffect,useRef } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { send, distanceToSteps, stepsToDistance,mmToIn, inToMM,viewPitch, mmOrImp } from './util.js';
import Moving from './Moving.js';
import MaxPitch from './MaxPitch.js';



export default function Bounce({ state, machineConfig,set_machineConfig,nvConfig,moveConfig,set_moveConfig}) {

  //const [distance, set_distance] = useState(0);
  //const [dwell,set_dwell] = useState(0);
  const [last_distance,set_last_distance] = useState(0);
  const distanceRef = useRef();
  const dwellRef = useRef();
  const movePitchRef = useRef();
  const rapidPitchRef = useRef();


  

  function do_bounce() {
    var c = moveConfig;
    c.moveSteps = distanceToSteps(state,nvConfig, distanceRef.current.value) 
    c.rapidPitch = parseFloat(rapidPitchRef.current.value)
    c.movePitch =  parseFloat(movePitchRef.current.value )
    c.dwell = parseInt(dwellRef.current.value);
    //c.dwell = dwell
    c.feeding_ccw = true; 
    if(state.metric != true){
      c.rapid = inToMM(rapidPitchRef.current.value);
      c.pitch = inToMM(movePitchRef.current.value);
    }
    var d = { cmd: "bounce", moveConfig: c }
    set_last_distance(distanceRef.current.value)
    send(d);
  }

  

  return (
    <div>
      {
        // hides controls when pos_feeding is true
        ( !state.stats["pos_feed"] && !state.stats["sw"] && machineConfig.m != 6) &&
        <div>
          <Button variant="dark" className="btn-block" > Bounce Settings</Button>
          <Row>
            <Col>
              <span> Set positive for Z+ negative for Z- </span>
              <InputGroup className="mb-3">
                <FormControl
                  aria-label="Distance to Move"
                  defaultValue={last_distance}
                  inputMode='numeric' step='any' type="number"
                  ref={distanceRef}
                />
                <InputGroup.Text id="notsure">
                  {state.metric == true ? "(mm)" : "(in)"}
                  Move Distance</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
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
                  defaultValue={viewPitch(state,moveConfig.rapidPitch)}
                  inputMode='numeric' step='any' type="number"
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
                  aria-label="Dwell Time"
                  defaultValue={moveConfig.dwell}
                  ref={dwellRef}
                  inputMode='decimal' step='any' type="number"
                />
                <InputGroup.Text id="dwell">
                  Dwell Time (ms (micro seconds))
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          <Button className="btn-block" onClick={() => do_bounce()}>Run Bounce</Button>
        </div>
      }

      <Row>
        <Moving 
          nvConfig={nvConfig}
          machineConfig={machineConfig}
          state={state} />

      </Row>
      { machineConfig.dbg &&
        <div>
          <div>raw nvConfig<pre>{JSON.stringify(state.nvConfig, null, 2)}</pre></div>
          </div>
      
      }

    </div>
  )
}
