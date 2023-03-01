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
import Feeding from './Feeding.js';
import Bounce from './Bounce.js';




export default function JogUI({config,setConfig,me,ws,stats,jogcancel,sendConfig}){
    const [enRL,setEnRL] = useState(true);
    const [enRR,setEnRR] = useState(true);
    const [showModalJog,setShowModalJog] = useState(false);
    const [jogconfig, set_jogconfig] = useState({pitch: 0.1,rapid: config.rapid});
    const [feedingLeft,set_feedingLeft] = useState(true);
    const [syncStart, set_syncStart] = useState(true);
    const [showJog, set_showJog] = useState(true);

    const colW = 5;

    // detect first run to ensure we validate pitch
    const [first_run, set_first_run] = useState(true);

    function jog(config,distance){
        /*

            WHy?  it seems you want to set jog pitch and rapid pitch differently in "new jog" vs "old jog" but why?
            Seems like heavy refactor is needed

        */
        var c = config;
        // TODO: add these to the UI
        c.f = feedingLeft;
        c.s = syncStart;
        c.pitch = jogconfig.pitch;

        c.jm = distance;
        var d = {cmd: "jog",config: c}
        console.log("jog ws",d,ws);
        ws.send(JSON.stringify(d));
      }
      function rapid(config,distance){
        var c = config;
        c.f = feedingLeft;
        c.s = syncStart;
        c.jm = distance;
        var d = {cmd: "rapid",config: c}
        console.log("rapid ws",d,ws);
        ws.send(JSON.stringify(d));
      }

    const handleJogClick = (id) => {
        console.log("Jog or Rapid Clicked", id,jog_mm);
        if(jog_mm == 0){
            console.log("unf");
            me.setModalErrorMsg("Can't Jog 0 mm");
            me.setShowModalError(true);
        }else{
            //var id = data.target.getAttribute(“id”);
            if(id == "rrapid"){
                console.log("right rapid");
                rapid(jogconfig,Math.abs(jog_mm));
            }else if(id == "lrapid"){
                console.log("left rapid");
                rapid(jogconfig,Math.abs(jog_mm) * -1);
            }
            else if(id == "ljog"){
                //console.log("left",jog_mm);
                jog(jogconfig,Math.abs(jog_mm) * -1);
            }else if(id == "rjog"){
                jog(jogconfig,Math.abs(jog_mm));
                //console.log("right",jog_mm);
            }else{
                console.log("WTF",id)
            }
        }
    }

    // set this to "u" for undefined so we can ensure it was actually set by the operator
    const [jog_mm, set_jog_mm] = useState(0);
    return(
        <div>
            <Tabs defaultActiveKey="jog" id="uncontrolled-tab-example" className="mb-3">
                <Tab eventKey="jog" title="Jog">
                { showJog && !stats["pos_feed"] && !stats["sw"] &&
            <div>
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
              
              <input type="checkbox" className="btn-check" id="btn-check-outlined" autoComplete="off"
                onClick={() => {setEnRL(!enRL)}}
                />
            <label className="btn btn-outline-primary" htmlFor="btn-check-outlined">Enable Rapid Left</label>


              </Col>
              <Col>
                        <input type="checkbox" className="btn-check" id="btn-en-rapidright" autoComplete="off" 
                onClick={() => {setEnRR(!enRR)}}
                />
                <label className="btn btn-outline-primary" htmlFor="btn-en-rapidright">Enable Rapid Right</label>
                </Col>
          </Row>
            <Row>
              <Col>
              <InputGroup className="mb-3">
                <FormControl
                placeholder="Distance to Jog"
                aria-label="Distance to Jog"
                aria-describedby="basic-addon2"
                value={jog_mm}
                inputMode='decimal' step='any' type="number"
                onChange={e => set_jog_mm(e.target.value)}
                />
                <InputGroup.Text id="notsure">(mm) Jog Distance</InputGroup.Text>
            </InputGroup>
              </Col>
          
          </Row>
            <Row>
             <Col xs={6} >
             <span>
                <button type="button" className="btn btn-outline-danger spaceBtn " disabled={enRL} id="lrapid" 
                    onClick={() => handleJogClick("lrapid")}>
                    <ArrowBarLeft />|<br />Rapid</button>
                <button type="button" className="btn btn-outline-dark spaceBtn" id="ljog" 
                    onClick={() => handleJogClick("ljog")}> 
                    <ArrowBarLeft /><br/>
                    Jog
                </button>
            </span>
                 
             </Col>
             <Col xs='auto'>
                <button type="button" className="btn btn-outline-dark spaceBtn" id="rjog" 
                    onClick={() => handleJogClick("rjog")}>
                    <ArrowBarRight/><br />Jog</button>
                <button type="button" className="btn btn-outline-danger spaceBtn " disabled={enRR} id="rrapid" 
                    onClick={() => handleJogClick("rrapid")}>
                    |<ArrowBarRight/><br />Rapid</button> 

             </Col>
                   </Row>
                
            <Row>
                <button className="btn btn-danger btn-block" type="button" size="lg"
                  onClick={() => {setShowModalJog(!showModalJog)}}>Jog Settings</button>
                <ModalJog config={config} setConfig={setConfig} jogconfig={jogconfig} set_jogconfig={set_jogconfig} show={showModalJog} setShow={setShowModalJog}></ModalJog>
           </Row>
           </div>
            }
           <Row>
            <Feeding stats={stats} jogcancel={jogcancel}></Feeding>
                
            </Row>


                </Tab>
                <Tab eventKey="bounce" title="Bounce">
                   <Bounce ws={ws}></Bounce>
                </Tab>
            </Tabs>
        </div>
   )
}
