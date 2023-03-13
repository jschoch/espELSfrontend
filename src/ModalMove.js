
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { send,mmToIn,inToMM,stepsToDistance,mmOrImp } from './util.js';
import MaxPitch from './MaxPitch.js';



export default function ModalMove({ state,show,set_show,moveConfig,set_moveConfig,nvConfig }) {
  const [movePitch, set_movePitch] = useState(moveConfig.movePitch);
  const [rapidPitch, set_rapidPitch] = useState(moveConfig.rapidPitch);
  const handleClose = () => {
    var c = moveConfig;
    if(nvConfig.metric == "true"){
      c.pitch = movePitch;
      c.movePitch = movePitch;
      c.rapid = rapidPitch;
      c.rapidPitch = rapidPitch;
      set_moveConfig(c);
    }else{
      c.pitch = inToMM(movePitch);
      c.movePitch = inToMM(movePitch);
      c.rapid = inToMM(rapidPitch);
      c.rapidPitch = inToMM(rapidPitch);
      set_moveConfig(c);
    }
    console.log("ModalMove moveConfig updated", moveConfig);
    set_show(false);
    var d = { cmd: "sendMoveConfig", config: c }
    if( Number.isFinite(c.pitch) && Number.isFinite(c.rapid) ){
      send(d);
    }else{
      console.log("MoveModal: bad number error",c)
    }
  }
  const mp = moveConfig.movePitch;
  //const ip = (config.pitch * (1/25.4)).toFixed(4);
  const ip = mmToIn(moveConfig.movePitch);

  const mr = moveConfig.rapidPitch;
  //const ir = (config.rapid * (1/25.4)).toFixed(4);
  const ir = mmToIn(moveConfig.rapidPitch);


  useEffect (() => {
    /* TODO fix thsi
    if(nvConfig.metric == "true"){
      set_movePitch( config.pitch);
      set_movePitch( config.rapid);
    }else{
      set_movePitch( mmToIn(config.pitch));
      set_rapidPitch( mmToIn(config.rapid));
    }
    */
    console.log("fix useEffect for unit changes",state);
  },[nvConfig.metric,moveConfig.movePitch,moveConfig.rapidPitch])


  return (



    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Move Settings</Modal.Title>
      </Modal.Header>
      <MaxPitch nvConfig={nvConfig}/> {mmOrImp(nvConfig)}
      <Modal.Body>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="rapidPitch">Rapid Pitch {mmOrImp(nvConfig)}</InputGroup.Text>
          <FormControl aria-label="Small" aria-describedby="rapidPitch"
            inputMode='decimal' step='any' type="number"
            placeholder={(nvConfig.metric == "true") ? mr : ir} 
            onChange={(e) => set_rapidPitch(parseFloat(e.target.value))}
          />
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Text id="movePitch" >Move Pitch {mmOrImp(nvConfig)}</InputGroup.Text>
          <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm"
            inputMode='decimal' step='any' type="number"
            placeholder={(nvConfig.metric == "true") ? mp : ip} 
            onChange={(e) => set_movePitch(parseFloat(e.target.value))}
          />
        </InputGroup>

      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>Update Settings</Button>
      </Modal.Footer>
    </Modal>
  )
}
