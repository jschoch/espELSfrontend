
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';



export default function ModalJog({config,set_config,show, setShow }){
    const [jogPitch, setJogPitch] = useState(config.pitch);
    const [rapidPitch, set_rapidPitch] = useState(0.5);
    const handleClose = () => {
        var c = config;
        c.pitch = jogPitch;
        c.rapid = rapidPitch;
        console.log("pitch, rapid",jogPitch,rapidPitch);
        set_config(c);
        setShow(false);
    }
    const handleShow = () => setShow(true);
    return(



<Modal show={show} onHide={handleClose}>
  <Modal.Header closeButton>
    <Modal.Title>Jog Settings</Modal.Title>
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
    <InputGroup.Text id="jogPitch" >Jog Pitch</InputGroup.Text>
    <FormControl placeholder={config.pitch} aria-label="Small" aria-describedby="inputGroup-sizing-sm"
        inputMode='decimal' step='any' type="number"
        value={jogPitch} onChange={(e) => setJogPitch(e.target.value)} 
    />
  </InputGroup>

  </Modal.Body>

  <Modal.Footer>
    <Button variant="primary" onClick={handleClose}>Update Settings</Button>
  </Modal.Footer>
</Modal>
    )
}