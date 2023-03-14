import  { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { send, distanceToSteps, stepsToDistance,mmToIn, inToMM,viewPitch, mmOrImp } from './util.js';
import Moving from './Moving.js';
import MaxPitch from './MaxPitch.js';



export default function Bounce({ state, machineConfig,set_machineConfig,nvConfig,moveConfig,set_moveConfig}) {

  const [distance, set_distance] = useState(0);
  const [move_pitch, set_move_pitch] = useState(moveConfig.movePitch);
  const [rapid_pitch, set_rapid_pitch] = useState(moveConfig.rapidPitch);
  const [dwell,set_dwell] = useState(0);


  

  function do_bounce() {
    var mc = moveConfig;
    var c = { 
      moveSteps: distanceToSteps(state,nvConfig, distance), 
      rapid: rapid_pitch, 
      pitch: move_pitch, 
      dwell: dwell,
      f: true 
    };
    if(state.metric != "true"){
      c.rapid = inToMM(rapid_pitch);
      c.pitch = inToMM(move_pitch);
    }
    mc.movePitch = c.pitch;
    mc.rapidPitch = c.rapid;
    //set_moveConfig(mc);
    var d = { cmd: "bounce", config: c }
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
                  value={distance}
                  inputMode='numeric' step='any' type="number"
                  onChange={e => set_distance(e.target.value)}
                />
                <InputGroup.Text id="notsure">
                  {state.metric == "true" ? "(mm)" : "(in)"}
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
                  //value={() => {viewPitch(moveConfig.movePitch)}}
                  placeholder={viewPitch(state,moveConfig.movePitch)}
                  inputMode='numeric' step='any' type="number"
                  onChange={(e) => set_move_pitch( e.target.value)}
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
                  onChange={(e) => set_rapid_pitch( e.target.value)}
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
                  value={dwell}
                  inputMode='decimal' step='any' type="number"
                  onChange={e => set_dwell(parseFloat(e.target.value))}
                />
                <InputGroup.Text id="dwell">
                  Dwell Time (seconds)
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
