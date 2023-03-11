import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { ArrowBarLeft, ArrowLeft, ArrowRight, ArrowBarRight } from 'react-bootstrap-icons';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ModalMove from './ModalMove.js';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Moving from './Moving.js';
import Bounce from './Bounce.js';
import { distanceToSteps, mmOrImp, mmToIn, send } from './util.js';




export default function MoveSyncUI({ config, setConfig, me, stats, sendConfig, nvConfig,connected }) {
    // enable flag for rapid left
    const [enRL, setEnRL] = useState(true);
    // enable flag for enable rapid right
    const [enRR, setEnRR] = useState(true);
    const [showModalMove, set_showModalMove] = useState(false);
    const [moveConfig, set_moveConfig] = useState({ pitch: 0.1, rapid: config.rapid });
    const [feedingLeft, set_feedingLeft] = useState(true);
    const [syncStart, set_syncStart] = useState(true);
    // set this to "u" for undefined so we can ensure it was actually set by the operator
    const [distance, set_distance] = useState(0);

    const colW = 5;

    function moveSync(config, distance) {
        /*

            WHy?  it seems you want to set jog pitch and rapid pitch differently in "new jog" vs "old jog" but why?
            Seems like heavy refactor is needed

        */
        console.log("distance", distance);
        var c = config;
        // TODO: add these to the UI
        c.f = feedingLeft;
        c.s = syncStart;
        c.pitch = moveConfig.pitch;

        c.moveSteps = distanceToSteps(nvConfig, distance);
        var d = { cmd: "jog", config: c }
        send(d);
    }
    function rapid(config, distance) {
        var c = config;
        c.f = feedingLeft;
        c.s = syncStart;
        c.jm = distance;
        var d = { cmd: "rapid", config: c }
        send(d);
    }

    const handleJogClick = (id) => {
        console.log("Jog or Rapid Clicked", id, distance);
        if (distance == 0) {
            console.log("unf");
            me.setModalErrorMsg("Can't Move 0 ");
            me.setShowModalError(true);
        } else {
            if (id == "rrapid") {
                console.log("right rapid");
                rapid(moveConfig, Math.abs(distance));
            } else if (id == "lrapid") {
                console.log("left rapid");
                rapid(moveConfig, Math.abs(distance) * -1);
            }
            else if (id == "ljog") {
                moveSync(moveConfig, Math.abs(distance) * -1);
            } else if (id == "rjog") {
                moveSync(moveConfig, Math.abs(distance));
            } else {
                console.log("WTF", id)
            }
        }
    }

    
    return (
        <div>
            { config.m == 2 &&
            <Tabs defaultActiveKey="syncMove" id="uncontrolled-tab-example" className="mb-3">
                <Tab eventKey="syncMove" title="Move slaved to spindle">
                    {
                        // hides controls when pos_feeding is true
                        !stats["pos_feed"] && !stats["sw"] &&
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
                                    Current Pitch set to: {(nvConfig.metric == "true" ? config.pitch : mmToIn(config.pitch))}  
                                    {mmOrImp(nvConfig)}
                                    {(!enRL || !enRR) &&
                                        <span>
                                            Rapid Pitch: {moveConfig.rapid}
                                        </span>
                                    }
                                </p>
                            </Row>
                            <Row>
                                <Col xs={10}>
                                <Button className="btn btn-danger btn-block" type="button" size="lg"
                                    onClick={() => { set_showModalMove(!showModalMove) }}>Change Move Settings
                                </Button>
                                <ModalMove config={config} setConfig={setConfig}
                                    nvConfig={nvConfig}
                                    moveConfig={moveConfig} set_moveConfig={set_moveConfig}
                                    show={showModalMove} set_show={set_showModalMove} />
                                </Col>
                            </Row>
                            <Row>
                                <Col>

                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="notsure">
                                            ( { mmOrImp(nvConfig)} )
                                            Move Distance</InputGroup.Text>
                                        <FormControl
                                            placeholder="Distance to Move"
                                            aria-label="Distance to Move"
                                            aria-describedby="basic-addon2"
                                            value={distance}
                                            inputMode='decimal' step='any' type="number"
                                            onChange={e => set_distance(e.target.value)}
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
                        <Moving stats={stats} nvConfig={nvConfig} />

                    </Row>


                </Tab>
                <Tab eventKey="bounce" title="Bounce">
                    <Bounce stats={stats} nvConfig={nvConfig} config={config}></Bounce>
                </Tab>
                <Tab eventKey="FreeJog" title="Jog (non sync)">
                    TODO:
                </Tab>
            </Tabs>
            }
        </div>
    )
}
