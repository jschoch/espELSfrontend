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
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';




export default function JogUI({config,me,ws}){
    const [enRL,setEnRL] = useState(true);
    const [enRR,setEnRR] = useState(true);
    const [showModalJog,setShowModalJog] = useState(false);
    const [jogconfig, set_jogconfig] = useState({pitch: 0.1,rapid: config.rapid});

    // detect first run to ensure we validate pitch
    const [first_run, set_first_run] = useState(true);

    function jog(config,distance){
        var c = config;
        c.jm = distance;
        var d = {cmd: "jog",config: config}
        console.log("jog ws",d,ws);
        //ws.send(JSON.stringify(d));
      }
      function rapid(config,distance){
        var c = config;
        c.jm = distance;
        var d = {cmd: "rapid",config: config}
        console.log("rapid ws",d,ws);
      }

    const handleJogClick = (data) => {
        console.log("Left Jog Clicked", data,jog_mm);
        if(jog_mm == 0){
            console.log("unf");
            me.setModalErrorMsg("Can't Jog 0 mm");
            me.setShowModalError(true);
        }else{
            if(data.target.id == "rrapid"){
                console.log("right rapid");
                rapid(jogconfig,Math.abs(jog_mm));
            }else if(data.target.id == "lrapid"){
                console.log("left rapid");
                rapid(jogconfig,Math.abs(jog_mm) * -1);
            }
            else if(data.target.id == "ljog"){
                //console.log("left",jog_mm);
                jog(jogconfig,Math.abs(jog_mm) * -1);
            }else{
                jog(jogconfig,Math.abs(jog_mm));
                //console.log("right",jog_mm);
            }
        }
    }

    // set this to "u" for undefined so we can ensure it was actually set by the operator
    const [jog_mm, set_jog_mm] = useState(0);
    return(
        <div>
            <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" className="mb-3">
                <Tab eventKey="jog" title="Jog">
            <Row>
                <Col>
                <span>
                Pitch: {jogconfig.pitch} {(!enRL || !enRR) &&
                    <span>
                        Rapid Pitch: {jogconfig.rapid}
                    </span>
                   }
                </span>
                </Col>
            </Row>
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
      value={jog_mm}
      onChange={e => set_jog_mm(e.target.value)}
    />
    <InputGroup.Text id="notsure">(mm) Jog Distance</InputGroup.Text>
  </InputGroup>
              </Col>
          
          </Row>
          <Row>
             <Col xs={5} >
             <span>
                <button type="button" className="btn btn-outline-danger spaceBtn " disabled={enRL} id="lrapid" onClick={handleJogClick}>
                    <ArrowBarLeft />|<br />Rapid</button>
                <button type="button" className="btn btn-outline-dark spaceBtn" id="ljog" onClick={handleJogClick}> 
                    <ArrowBarLeft /><br/>
                    Jog
                </button>
            </span>
             </Col> 

             <Col xs={2}>
                 
             </Col>
             <Col xs={5}>
                <button type="button" className="btn btn-outline-dark spaceBtn" id="rjog" onClick={handleJogClick}>
                    <ArrowBarRight/><br />Jog</button>
                <button type="button" className="btn btn-outline-danger spaceBtn " disabled={enRR} id="rrapid" onClick={handleJogClick}>
                    |<ArrowBarRight/><br />Rapid</button> 

             </Col>
                   </Row>
          <div class="d-grid gap-1">
            <button className="btn btn-danger btn-block" type="button" size="lg"
                onClick={() => {setShowModalJog(!showModalJog)}}>Jog Settings</button>
           </div>
           <ModalJog config={jogconfig} set_config={set_jogconfig} show={showModalJog} setShow={setShowModalJog}></ModalJog>


                </Tab>
                <Tab eventKey="bounce" title="Bounce">
                    <Button variant="dark" className="btn-block" > Bounce Settings</Button>
                   <Button disabled className="btn-block"> Run Bounce </Button> 
                </Tab>
            </Tabs>
        </div>
   )
}