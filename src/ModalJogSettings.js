
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function ModalJog(props){
    const handleClose = () => props.setShow(false);
    const handleShow = () => props.setShow(true);
    return(



<Modal show={props.show} onHide={handleClose}>
  <Modal.Header closeButton>
    <Modal.Title>Jog Settings</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    Rapid Pitch: 1
    Jog Pitch: .1
  </Modal.Body>

  <Modal.Footer>
    <Button variant="primary" onClick={handleClose}>Update Settings</Button>
  </Modal.Footer>
</Modal>
    )
}