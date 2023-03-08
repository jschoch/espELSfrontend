import  { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { send, distanceToSteps, stepsToDistance } from './util.js';
import Moving from './Moving.js';



export default function Bounce({ stats, nvConfig, config,connected }) {
  const [jog_mm, set_jog_mm] = useState(0);
  const [move_pitch, set_move_pitch] = useState(config.pitch);
  const [rapid_pitch, set_rapid_pitch] = useState(config.rapid);

  function metric_p_to_in(test, p) {
    console.log("tests", test, p);
    if (test != "true") {
      var r = ((1 / 25.4) * p)
      console.log("returning in",r);
      return r
    }
    else {
      return p;
    }
  }

  

  function bounce(distance) {
    var c = { moveSteps: distanceToSteps(nvConfig, jog_mm), rapid: rapid_pitch, pitch: move_pitch, f: true };
    var d = { cmd: "bounce", config: c }
    send(d);
  }

  useEffect (() => {
    if(nvConfig.lead_screw_pitch && config.pitch){
      console.log("gash, " , nvConfig,config);
      set_move_pitch(metric_p_to_in(nvConfig.metric,config.pitch));
      set_rapid_pitch(metric_p_to_in(nvConfig.metric,config.rapid));
      return;
    }
    
    return () => console.log('something ');

  },[nvConfig.lead_screw_pitch,config.pitch,connected,nvConfig.metric]);

  return (
    <div>
      {
        // hides controls when pos_feeding is true
        !stats["pos_feed"] && !stats["sw"] &&
        <div>
          <Button variant="dark" className="btn-block" > Bounce Settings</Button>
          <Row>
            <Col>
              <span> Set positive for Z+ negative for Z- TODO: is this an issue with number chooser on phone?</span>
              <InputGroup className="mb-3">
                <FormControl
                  aria-label="Distance to Move"
                  value={jog_mm}
                  inputMode='numeric' step='any' type="number"
                  onChange={e => set_jog_mm(e.target.value)}
                />
                <InputGroup.Text id="notsure">
                  {nvConfig == "true" ? "(mm)" : "(in)"}
                  Jog Distance</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mb-3">
                <FormControl
                  aria-label="Bounce Pitch"
                  value={move_pitch}
                  inputMode='decimal' step='any' type="number"
                  onChange={e => set_move_pitch(e.target.value)}
                />
                <InputGroup.Text id="unf">
                  {nvConfig == "true" ? "(mm)" : "(in)"}
                  Move Pitch</InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mb-1">
                <FormControl
                  aria-label="Rapid Pitch"
                  value={rapid_pitch}
                  inputMode='decimal' step='any' type="number"
                  onChange={e => set_rapid_pitch(e.target.value)}
                />
                <InputGroup.Text id="rp">
                  {nvConfig == "true" ? "(mm)" : "(in)"}
                  Rapid Pitch
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          <Button className="btn-block" onClick={() => bounce()}>Run Bounce</Button>
        </div>
      }

      <Row>
        <Moving stats={stats} nvConfig={nvConfig} />

      </Row>
      { config.dbg &&
        <div>
          <div>raw nvConfig<pre>{JSON.stringify(nvConfig, null, 2)}</pre></div>
          </div>
      
      }

    </div>
  )
}
