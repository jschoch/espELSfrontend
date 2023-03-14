
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { send, mmToIn, inToMM, stepsToDistance, mmOrImp, viewPitch } from './util.js';
import MaxPitch from './MaxPitch.js';



export default function ModalMove({ state, show, set_show, moveConfig, set_moveConfig, nvConfig, machineConfig }) {
  const [movePitch, set_movePitch] = useState(moveConfig.movePitch);
  const [rapidPitch, set_rapidPitch] = useState(moveConfig.rapidPitch);
  const handleClose = () => {
    var c = moveConfig;
    if (state.metric == "true") {
      c.pitch = movePitch;
      c.movePitch = movePitch;
      c.rapid = rapidPitch;
      c.rapidPitch = rapidPitch;
    } else {
      c.pitch = inToMM(movePitch);
      c.movePitch = inToMM(movePitch);
      c.rapid = inToMM(rapidPitch);
      c.rapidPitch = inToMM(rapidPitch);
    }
    console.log("ModalMove moveConfig updated", moveConfig);
    set_show(false);
    var d = { cmd: "sendMoveConfig", config: c }
    if (Number.isFinite(c.pitch) && Number.isFinite(c.rapid)) {
      send(d);
    } else {
      console.log("MoveModal: bad number error", c)
    }
  }


  return (



    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Move Settings</Modal.Title>
      </Modal.Header>
      <MaxPitch state={state} nvConfig={nvConfig} /> {mmOrImp(state)}
      <Modal.Body>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="rapidPitch">
            Move Pitch {mmOrImp(state)}
          </InputGroup.Text>
          <FormControl aria-label="Small" aria-describedby="rapidPitch"
            inputMode='decimal' step='any' type="number"
            placeholder={viewPitch(state, moveConfig.movePitch)}
            onChange={(e) => {
              var t = parseFloat(e.target.value);
              if(Number.isFinite(t)){
                set_movePitch(parseFloat(e.target.value))}
              }
            }
          />
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="movePitch" >
            Rapid Pitch {mmOrImp(state)}
          </InputGroup.Text>
          <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm"
            inputMode='decimal' step='any' type="number"
            placeholder={viewPitch(state, moveConfig.rapidPitch)}
            onChange={(e) => {
              var t = parseFloat(e.target.value);
              if(Number.isFinite(t)){
                set_rapidPitch(parseFloat(e.target.value))}
              }
            } 
          />
        </InputGroup>

      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>Update Settings</Button>
      </Modal.Footer>
    </Modal>
  )
}
