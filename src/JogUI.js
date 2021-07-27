import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { ArrowBarLeft, ArrowLeft, ArrowRight,ArrowBarRight } from 'react-bootstrap-icons';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ModalJog from './ModalJogSettings.js';

export default function ModeSel(props){
    const [enRL,setEnRL] = useState(true);
    const [enRR,setEnRR] = useState(true);
    const [showModalJog,setShowModalJog] = useState(false);
    return(
        <div>
          <Row>
              <Col>
              
              <input type="checkbox" className="btn-check" id="btn-check-outlined" autocomplete="off"
                onClick={() => {setEnRL(!enRL)}}
                />
            <label className="btn btn-outline-primary" for="btn-check-outlined">Enable Rapid Left</label>


              </Col>
              <Col>
                        <input type="checkbox" className="btn-check" id="btn-en-rapidright" autocomplete="off" 
                onClick={() => {setEnRR(!enRR)}}
                />
                <label className="btn btn-outline-primary" for="btn-en-rapidright">Enable Rapid Right</label>
                </Col>
          </Row>
          <Row>
              <Col>
              <InputGroup className="mb-3">
    <FormControl
      placeholder="Distance to Jog"
      aria-label="Recipient's username"
      aria-describedby="basic-addon2"
    />
    <InputGroup.Text id="notsure">(mm)</InputGroup.Text>
  </InputGroup>
              </Col>
          
          </Row>
          <Row>
             <Col xs={5} >
             <span>
                <button type="button" className="btn btn-outline-danger spaceBtn " disabled={enRL}>
                    <ArrowBarLeft />|<br />Rapid</button>
                <button type="button" className="btn btn-outline-dark spaceBtn"><ArrowBarLeft /><br/>Jog</button>
            </span>
             </Col> 

             <Col xs={2}>
                 
             </Col>
             <Col xs={5}>
                <button type="button" className="btn btn-outline-dark spaceBtn"><ArrowBarRight/><br />Jog</button>
                <button type="button" className="btn btn-outline-danger spaceBtn " disabled={enRR}>|<ArrowBarRight/><br />Rapid</button> 

             </Col>
                   </Row>
          <div class="d-grid gap-1">
            <button className="btn btn-danger btn-block" type="button" size="lg"
                onClick={() => {setShowModalJog(!showModalJog)}}>Jog Settings</button>
           </div>
           <ModalJog show={showModalJog} setShow={setShowModalJog}></ModalJog>

        </div>
   )
}