
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { send } from './util.js';

/*
function metric_p_to_in(test,p){
  if(test == "true"){
    return (1/25.4 * p);
  }
  else {
    return p;
  }
}

export default function Bounce({ stats,config,nvConfig }) {
  const [jog_mm, set_jog_mm] = useState(0);
  const [jog_pitch, set_jog_pitch] = useState( metric_p_to_in(nvConfig.metric,config.pitch)); 
  const [rapid_pitch, set_rapid_pitch] = useState(metric_p_to_in(nvConfig.metric,config.rapid));
 */


export default function ModalMove({ config, setConfig, nvConfig,show,set_show }) {
  const [movePitch, set_movePitch] = useState(config.pitch);
  const [rapidPitch, set_rapidPitch] = useState(config.rapid);
  const handleClose = () => {
    var c = config;
    if(nvConfig.metric == "true"){
      c.pitch = movePitch;
      c.rapid = rapidPitch;
    }else{
      c.pitch = movePitch * 25.4;
      c.rapid = rapidPitch * 25.4;
    }
    
    setConfig(c);
    console.log("pitch, rapid", movePitch, rapidPitch);
    set_show(false);
    var d = { cmd: "sendConfig", config: config }
    send(d);
  }
  const mp = config.pitch;
  const ip = (config.pitch * (1/25.4)).toFixed(4);

  const mr = config.rapid;
  const ir = (config.rapid * (1/25.4)).toFixed(4);

  return (



    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Move Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="rapidPitch">Rapid Pitch</InputGroup.Text>
          <FormControl aria-label="Small" aria-describedby="rapidPitch"
            inputMode='decimal' step='any' type="number"
            placeholder={(nvConfig.metric == "true") ? mr : ir} 
            onChange={(e) => set_rapidPitch(e.target.value)}
          />
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="movePitch" >Move Pitch</InputGroup.Text>
          <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm"
            inputMode='decimal' step='any' type="number"
            placeholder={(nvConfig.metric == "true") ? mp : ip} 
            onChange={(e) => set_movePitch(e.target.value)}
          />
        </InputGroup>

      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>Update Settings</Button>
      </Modal.Footer>
    </Modal>
  )
}
