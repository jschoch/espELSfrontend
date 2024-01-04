import React, { Component, useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge'
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { send, mmToIn, inToMM, distanceToSteps, stepsToDistance, mmOrImp, viewPitch } from './util.js';
import MaxPitch from './MaxPitch.js';



const KV = (props) => {
  const { k, v } = props;
  return (

    <span className="margin-left">
      <Button variant="primary margin-left">
        {k}<Badge variant="light">{v}</Badge>
        <span className="sr-only"></span>
      </Button>
    </span>

  );
};


const KVB = (props) => {
  const { k, v } = props;
  return (

    <span className="margin-left">
      <Button variant="primary margin-left">
        {k}
        <Badge bg="info">
          {v == true ? "On" : "Off"}
        </Badge>
        <span className="sr-only">

        </span>
      </Button>
    </span>

  );
};

export default function ShowMoveOptions({ state, moveConfig, set_moveConfig, nvConfig, machineConfig }) {
  const [move_pitch, set_move_pitch] = useState(moveConfig.movePitch);
  const [rapid_pitch, set_rapid_pitch] = useState(moveConfig.rapidPitch);
  const [distance, set_distance] = useState(0);
  const [dwell, set_dwell] = useState(0);
  const movePitchRef = useRef();
  const rapidPitchRef = useRef();
  const accelRef = useRef();
  const distanceRef = useRef();
  const speedRef = useRef();
  const dwellRef = useRef();

  const testThing = (data) => {
    var c = moveConfig;
    c.startSync = false;
    //c.movePitch = parseFloat(movePitchRef.current.value);
    //c.rapidPitch = parseFloat(rapidPitchRef.current.value)
    if (state.metric != "true") {
      c.movePitch = inToMM(c.movePitch);
      c.rapidPitch = inToMM(c.rapidPitch);
    }

    //var d = Math.abs(distanceRef.current.value) * modifier;
    //c.moveSteps = distanceToSteps(state, nvConfig, d);
    //c.feeding_ccw = (c.moveSteps > 0);
    //c.moveSteps = stepsInt;
    c.moveSteps = distanceToSteps(state, nvConfig, distanceRef.current.value);
    c.feeding_ccw = true;
    c.accel = parseInt(accelRef.current.value);
    c.moveSpeed = parseInt(speedRef.current.value);

    var d = { cmd: "moveAsync", moveConfig: c };
    console.log("cmd", d);
    send(d);
  }

  const doAsyncDwellBounce = (e) => {
    var c = moveConfig
    c.startSync = false;
    /*
    c.movePitch = parseFloat(movePitchRef.current.value);
    c.rapidPitch = parseFloat(rapidPitchRef.current.value)
    if (state.metric != "true") {
        c.movePitch = inToMM(c.movePitch);
        c.rapidPitch = inToMM(c.rapidPitch);
    }
    */

    c.moveSteps = distanceToSteps(state, nvConfig, distanceRef.current.value);
    c.feeding_ccw = true;
    c.accel = parseInt(accelRef.current.value);
    c.moveSpeed = parseInt(speedRef.current.value);
    c.dwell = parseInt(dwellRef.current.value);
    var d = { cmd: "bounceAsync", moveConfig: c };
    console.log("cmd", d);
    send(d);

  }

  const cancelThing = () => {
    send({ cmd: "moveCancel" })
  }

  const updateMoveConf = (data) => {
    const p = movePitchRef.current.value;
    const rp = rapidPitchRef.current.value;
    console.log("updateMoveConfg", p, rp);
    var c = {
      moveSteps: distanceToSteps(state, nvConfig, distance),
      rapidPitch: rp,
      pitchPitch: p,
      dwell: dwell,
      accel: accelRef.current.value,
      f: true
    };
    if (state.metric != "true") {
      c.rapidPitch = inToMM(rp);
      c.pitchPitch = inToMM(p);
    }
    //set_moveConfig(mc);
    var d = { cmd: "sendMoveConfig", config: c }
    send(d);
  }
  return (
    <div>
      <Row>
        <Col>
        <h3>
          Not Well Tested, default acceleration may not work for your machine.  Hard to repeat startup bug where it does not stop, hit e-stop to halt.
        </h3>
          <span>
            <MaxPitch
              state={state}
              nvConfig={nvConfig} />

            {machineConfig.dbg &&
              <span> Current Pitch: {machineConfig.movePitch} Rapid: {machineConfig.rapidPitch} </span>}
          </span>
        </Col>
      </Row>
      <Row>
        <Col>
          <InputGroup className="mb-1">
            <FormControl
              inputMode='numeric' step='any' type="number"
              defaultValue={moveConfig.accel ? moveConfig.accel : 50000}
              ref={accelRef}
            />
            <InputGroup.Text id="rp">
              Acceleration steps/s2
            </InputGroup.Text>

          </InputGroup>
        </Col>
        <Col>
          <InputGroup className="mb-1">
            <FormControl
              inputMode='numeric' step='any' type="number"
              defaultValue={moveConfig.moveSpeed ? moveConfig.moveSpeed : 8000}
              ref={speedRef}
            />
            <InputGroup.Text id="speed">
              Move Speed (hz)
            </InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <InputGroup className="mb-1">
            <FormControl
              inputMode='numeric' step='any' type="number"
              defaultValue={moveConfig.distance}
              ref={distanceRef}
            />
            <InputGroup.Text id="rp">
              Distance to Jog
            </InputGroup.Text>
          </InputGroup>
        </Col>

      </Row>


      <Row>
        <Col>


          <Button onClick={testThing} >
            Do Jog (not slaved to spindle)
          </Button>

          {state.stats.sr &&
            <Button
              variant="danger"
              onClick={cancelThing}>
              Cancel Move Async
            </Button>
          }
        </Col>
      </Row>
      <Row>
        <Col>
        <h3> the below async dwell bounce mode will bounce back and forth until you hit the estop or cancel button</h3>
          <InputGroup className="mb-1">
            <FormControl
              inputMode='numeric' step='any' type="number"
              defaultValue={moveConfig.dwell}
              ref={dwellRef}
            />
            <InputGroup.Text id="rp">
              Dwell timer in ms
            </InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col>
        
          <Button onClick={doAsyncDwellBounce}>
            Async Dwell Bounce
          </Button>
        </Col>
      </Row>
      <Row>


        <hr></hr>
      </Row>
      <Row>
        <Col>
          <KVB k="Running" v={state.stats.sr} />
          <KV k="Accel State" v={state.stats.as} />
          <KV k="frequency" v={state.stats.av} />
          <KV k="Steps delta" v={state.stats.asd} />
        </Col>

      </Row>


    </div>
  )

}
