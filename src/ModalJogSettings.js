
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

export default function ModalJog({config,show, setShow, jogPitch, setJogPitch}){
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return(



<Modal show={show} onHide={handleClose}>
  <Modal.Header closeButton>
    <Modal.Title>Jog Settings</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <InputGroup size="sm" className="mb-3">
    <InputGroup.Text id="rapidPitch">Rapid Pitch</InputGroup.Text>
    <FormControl placeholder={config.rapid} aria-label="Small" aria-describedby="rapidPitch" />
  </InputGroup>

  <InputGroup size="sm" className="mb-3">
    <InputGroup.Text id="jogPitch">Jog Pitch</InputGroup.Text>
    <FormControl placeholder={config.pitch} aria-label="Small" aria-describedby="inputGroup-sizing-sm" />
  </InputGroup>

  </Modal.Body>

  <Modal.Footer>
    <Button variant="primary" onClick={handleClose}>Update Settings</Button>
  </Modal.Footer>
</Modal>
    )
}