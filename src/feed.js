
import React, { useState } from 'react';
import { Button, ToggleButton, ButtonGroup, Container } from 'react-bootstrap';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { mmOrImp, send,mmToIn, viewPitch } from './util.js';
//import { state.stats } from 'fs';
//import Card from "react-boostrap/Card";
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

export default function Feed({ config, nvConfig, state,machineConfig,moveConfig, set_moveConfig }) {

    const [move_pitch, set_pitch] = useState(moveConfig.movePitch);
    const [reverse, set_reverse] = useState(true);


    // turn feed on
    const handleToggle = (data) => {
        var mc = moveConfig;
        var p = parseFloat(move_pitch);
        if(p == 0 || isNaN(p) || p === undefined){
            console.log("doh pitch was 0")
            state.me.setModalErrorMsg("Pitch can't be 0 ");
            state.me.setShowModalError(true);
            return;
        }
        var c = moveConfig;
        c.f = !reverse;
        //c.pitch = parseFloat(pitch);
        c.pitch = p;
        mc.movePitch = p;
        // TODO: how to handle feeding_ccw?
        //mc.f = c.f;


        // TODO: should send moveConfig on update pitch and leave that out of the cmd
        set_moveConfig(mc);
        if (state.stats.pos_feed) {
            var d = { cmd: "moveCancel" };
        } else {
            var d = { cmd: "feed", config: c };
        }


        send(d);
    };

    const mp = moveConfig.movePitch ;
    const long_ip = parseFloat(mmToIn(mp));
    const ip = long_ip.toFixed(4);


    return (
        <Container fluid>
            <div>
               

                <Row>

                    <Col xs={8}>
                        <div className="d-grid gap-1">
                            <ButtonGroup
                                size="xxl"
                                className="mb-4">
                                <Button onClick={() => { handleToggle("foo"); }}>
                                    Turn {state.stats.pos_feed ? "Off" : "On"}
                                </Button>
                            </ButtonGroup>
                        </div>
                        {!state.stats.pos_feed &&
                            <div>

                                <ButtonGroup className="mb-2">
                                    <InputGroup size="sm" className="mb-3">
                                        <InputGroup.Text id="movePitch" >
                                            Feed Pitch {mmOrImp(state)}
                                        </InputGroup.Text>
                                        <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm"
                                            inputMode='decimal' step='any' type="number"
                                            placeholder={viewPitch(state,move_pitch)}
                                            onChange={(e) => set_pitch(e.target.value)}
                                        />
                                    </InputGroup>

                                    <ToggleButton
                                        id="toggle-reverse"
                                        type="checkbox"
                                        variant="outline-primary"
                                        checked={reverse}
                                        value="1"
                                        onChange={(e) => set_reverse(e.currentTarget.checked)}
                                    >

                                        Reverse
                                    </ToggleButton>
                                </ButtonGroup>
                            </div>
                        }


                    </Col>
                    <Col className="xs4">
                        <span>
                            Current Config:
                        </span>
                        <span>
                            Pitch {moveConfig.movePitch}
                        </span>
                        {!state.stats.pos_feed &&
                            <Button>
                                Configure Presets
                            </Button>
                        }

                    </Col>
                </Row>
                <Row>
                    <Col>
                        {!state.stats.pos_feed &&
                            <div>
                                <ButtonGroup className="mb-2">

                                    <div className="d-grid gap-1">
                                        <DropdownButton
                                            id="presetdd"
                                            title="Presets"
                                            onSelect={(e) => { console.log("dd", e); }}

                                        >
                                            <Dropdown.Item eventKey="roughing">
                                                Roughing
                                            </Dropdown.Item>
                                            <Dropdown.Item eventKey="finishing">
                                                Finishing
                                            </Dropdown.Item>
                                        </DropdownButton>
                                    </div>

                                </ButtonGroup>
                            </div>}
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <span>
                            <h5>
                                Help:
                            </h5>
                            <p>
                                : This sets Full Time Feed mode.  Moves with spindle all the time.  Requires use of half nut or toggling spindle on/off
                                
                            </p>
                            <p>
                                If the spindle is spinning CCW the default setting should move the carriage Z-.  If the spindle is spinning CW the carriage should be moving Z+.  Click "Reverse" to flip this behavior.
                            </p>
                        </span>
                        <hr />
                    </Col>
                </Row>
            </div >
        </Container>
    )
}
