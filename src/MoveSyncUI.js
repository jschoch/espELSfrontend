import React, { Component, useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { ArrowBarLeft, ArrowLeft, ArrowRight, ArrowBarRight } from 'react-bootstrap-icons';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Moving from './Moving.js';
import Bounce from './Bounce.js';
import { distanceToSteps, inToMM, mmOrImp, mmToIn, send, viewPitch } from './util.js';
import ShowMoveOptions from './ShowMoveOptions.js';

import MaxPitch from './MaxPitch.js';



export default function MoveSyncUI({ state, machineConfig, set_machineConfig, nvConfig, moveConfig, set_moveConfig }) {
    // enable flag for rapid left
    const [enRL, setEnRL] = useState(true);
    // enable flag for enable rapid right
    const [enRR, setEnRR] = useState(true);
    const [showModalMove, set_showModalMove] = useState(false);
    const [feedingLeft, set_feedingLeft] = useState(true);
    const [syncStart, set_syncStart] = useState(true);
    const [last_distance, set_last_distance] = useState(0);

    const distanceRef = useRef();
    const movePitchRef = useRef();
    const rapidPitchRef = useRef();


    const colW = 5;

    function moveSync(modifier) {
        /*

            WHy?  it seems you want to set jog pitch and rapid pitch differently in "new jog" vs "old jog" but why?
            Seems like heavy refactor is needed

        */
        console.log("distance", distanceRef.current.value, state);
        var c = {};
        // TODO: add these to the UI
        c.f = feedingLeft;
        c.s = syncStart;
        c.pitch = movePitchRef.current.value;
        if (state.metric != "true") {
            c.pitch = inToMM(c.pitch);
        }
        // sets direction
        c.pitch = Math.abs(c.pitch)
        set_last_distance(Math.abs(distanceRef.current.value))
        var d = Math.abs(distanceRef.current.value) * modifier;
        c.moveSteps = distanceToSteps(state, nvConfig, d);
        var d = { cmd: "jog", config: c }
        send(d);
    }
    function rapid(modifier) {
        var c = {};
        c.f = feedingLeft;
        c.s = syncStart;
        c.rapid = rapidPitchRef.current.value
        // TODO: do we need to ensure this is positive?
        if (state.metric != "true") {
            c.rapid = inToMM(c.rapid);
        }
        // sets direction
        c.rapid = Math.abs(c.rapid)
        set_last_distance(Math.abs(distanceRef.current.value))
        var d = Math.abs(distanceRef.current.value) * modifier;
        c.moveSteps = distanceToSteps(state, nvConfig, d);
        console.log("rapid: ", c, state);
        var d = { cmd: "rapid", config: c }
        send(d);
    }

    const handleJogClick = (id) => {
        console.log("Jog or Rapid Clicked", id, distanceRef.current.value);
        if (distanceRef.current.value == 0) {
            console.log("unf");
            state.me.setModalErrorMsg("Can't Move 0 ");
            state.me.setShowModalError(true);
        } else {
            if (id == "rrapid") {
                console.log("right rapid", distanceRef.current.value);
                rapid(1);
            } else if (id == "lrapid") {
                console.log("left rapid", distanceRef.current.value);
                rapid(-1);
            }
            else if (id == "ljog") {
                moveSync(-1);
            } else if (id == "rjog") {
                moveSync(1);
            } else {
                console.log("WTF", id)
            }
        }
    }


    return (
        <div>
            {(machineConfig.m == 2 || machineConfig.m == 6) &&
                <Tabs defaultActiveKey="syncMove" id="uncontrolled-tab-example" className="mb-3">
                    <Tab eventKey="syncMove" title="Move slaved to spindle">
                        {
                            // hides controls when pos_feeding is true
                            !state.stats["pos_feed"] && !state.stats["sw"] &&
                            <div>
                                <Row>
                                    <Col>
                                        <label className="btn btn-outline-primary" htmlFor="btn-check-outlined"
                                            onClick={() => { setEnRL(!enRL) }} >Enable Rapid Left</label>


                                    </Col>
                                    <Col>
                                        <label className="btn btn-outline-primary" htmlFor="btn-en-rapidright"
                                            onClick={() => { setEnRR(!enRR) }}>Enable Rapid Right</label>
                                    </Col>
                                </Row>
                                <Row>
                                    <p className="text-center">
                                        Current Pitch set to: {(state.metric == "true" ? moveConfig.movePitch : mmToIn(moveConfig.movePitch))}
                                        {mmOrImp(state)}
                                        {(!enRL || !enRR) &&
                                            <span>
                                                Rapid Pitch: {moveConfig.rapid}
                                            </span>
                                        }
                                    </p>
                                </Row>
                                <Row>
                                    <Col>
                                        <span>
                                            <MaxPitch
                                                state={state}
                                                nvConfig={nvConfig} />

                                            {machineConfig.dbg &&
                                                <span> Current Pitch: {machineConfig.movePitch} Rapid: {machineConfig.rapidPitch} </span>}
                                        </span>
                                        <InputGroup className="mb-3">
                                            <FormControl
                                                aria-label="Bounce Pitch"
                                                inputMode='numeric' step='any' type="number"
                                                defaultValue={viewPitch(state, moveConfig.movePitch)}
                                                ref={movePitchRef}
                                            />
                                            <InputGroup.Text id="unf">
                                                {mmOrImp(state)}
                                                Move Pitch</InputGroup.Text>
                                        </InputGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <InputGroup className="mb-1">
                                            <FormControl
                                                aria-label="Rapid Pitch"
                                                defaultValue={viewPitch(state, moveConfig.rapidPitch)}
                                                inputMode='numeric' step='any' type="number"
                                                ref={rapidPitchRef}
                                            />
                                            <InputGroup.Text id="rp">
                                                {mmOrImp(state)}
                                                Rapid Pitch
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Col>
                                </Row>
                                <Row>
                                </Row>
                                <Row>
                                    <Col>

                                    </Col>
                                </Row>

                                <Row>
                                    <Col>
                                        <InputGroup className="mb-3">
                                            <InputGroup.Text id="notsure">
                                                ( {mmOrImp(state)} )
                                                Move Distance</InputGroup.Text>
                                            <FormControl
                                                placeholder="Distance to Move"
                                                aria-label="Distance to Move"
                                                aria-describedby="basic-addon2"
                                                defaultValue={last_distance}
                                                inputMode='decimal' step='any' type="number"
                                                ref={distanceRef}
                                            />

                                        </InputGroup>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col xs={5} >
                                        <Button type="button" className="btn btn-danger spaceBtn " disabled={enRL} id="lrapid"
                                            onClick={() => handleJogClick("lrapid")}>
                                            <ArrowBarLeft />|<br />Rapid Z-
                                        </Button>
                                        <Button type="button" className="btn btn-outline-dark spaceBtn" id="ljog"
                                            onClick={() => handleJogClick("ljog")}>
                                            <ArrowBarLeft /><br />
                                            Move
                                        </Button>
                                    </Col>

                                    <Col xs='auto'>
                                        <Button type="button" className="btn btn-outline-dark spaceBtn" id="rjog"
                                            onClick={() => handleJogClick("rjog")}>
                                            <ArrowBarRight /><br />Move
                                        </Button>
                                        <Button type="button" className="btn btn-danger spaceBtn " disabled={enRR} id="rrapid"
                                            onClick={() => handleJogClick("rrapid")}>
                                            |<ArrowBarRight /><br />Rapid Z+
                                        </Button>

                                    </Col>
                                </Row>


                            </div>
                        }
                        <Row>
                            <Moving
                                nvConfig={nvConfig}
                                machineConfig={machineConfig}
                                state={state} />

                        </Row>


                    </Tab>
                    <Tab eventKey="bounce" title="Bounce">
                        <Bounce
                            state={state}
                            machineConfig={machineConfig}
                            set_machineConfig={set_machineConfig}
                            moveConfig={moveConfig}
                            set_moveConfig={set_moveConfig}
                            nvConfig={nvConfig}
                        ></Bounce>
                    </Tab>
                    <Tab eventKey="FreeJog" title="Jog (non sync)">
                        TODO:...
                        <ShowMoveOptions
                            state={state}
                            machineConfig={machineConfig}
                            set_machineConfig={set_machineConfig}
                            moveConfig={moveConfig}
                            set_moveConfig={set_moveConfig}
                            nvConfig={nvConfig}
                        />
                    </Tab>
                </Tabs>
            }
        </div>
    )
}
