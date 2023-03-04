
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';



export default function ModalMove({config,setConfig,moveConfig,set_moveConfig,show, setShow }){
    const [movePitch, set_movePitch] = useState(moveConfig.pitch);
    const [rapidPitch, set_rapidPitch] = useState(0.5);
    const handleClose = () => {
        var c = config;
        c.pitch = movePitch;
        c.rapid = rapidPitch;
        setConfig(c)
        console.log("pitch, rapid",movePitch,rapidPitch);
        set_moveConfig(c);
        setShow(false);
    }
    const handleShow = () => setShow(true);
    return(



<Modal show={show} onHide={handleClose}>
  <Modal.Header closeButton>
    <Modal.Title>Move Settings</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <InputGroup size="sm" className="mb-3">
    <InputGroup.Text id="rapidPitch">Rapid Pitch</InputGroup.Text>
    <FormControl placeholder={config.rapid} aria-label="Small" aria-describedby="rapidPitch" 
        inputMode='decimal' step='any' type="number"
         value={rapidPitch} onChange={(e) => set_rapidPitch(e.target.value)}
    />
  </InputGroup>

  <InputGroup size="sm" className="mb-3">
    <InputGroup.Text id="movePitch" >Move Pitch</InputGroup.Text>
    <FormControl placeholder={config.pitch} aria-label="Small" aria-describedby="inputGroup-sizing-sm"
        inputMode='decimal' step='any' type="number"
        value={movePitch} onChange={(e) => set_movePitch(e.target.value)} 
    />
  </InputGroup>

  </Modal.Body>

  <Modal.Footer>
    <Button variant="primary" onClick={handleClose}>Update Settings</Button>
  </Modal.Footer>
</Modal>
    )
}
