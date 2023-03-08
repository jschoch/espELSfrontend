
import React, { useState } from 'react';
import { Button, ToggleButton, ButtonGroup, Container } from 'react-bootstrap';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { send } from './util.js';
import { Stats } from 'fs';
//import Card from "react-boostrap/Card";
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

export default function Feed({ config, nvConfig, stats }) {

    const [pitch, set_pitch] = useState(config.pitch);
    const [reverse, set_reverse] = useState(true);
    const handleToggle = (data) => {
        var c = config;
        c.f = !reverse;
        c.pitch = parseFloat(pitch);
        if (stats.pos_feed) {
            var d = { cmd: "moveCancel" };
        } else {
            var d = { cmd: "feed", config: c };
        }


        send(d);
    };

    const mp = config.pitch;
    const ip = (config.pitch * (1 / 25.4)).toFixed(4);


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
                                    Turn {stats.pos_feed ? "Off" : "On"}
                                </Button>
                            </ButtonGroup>
                        </div>
                        {!stats.pos_feed &&
                            <div>

                                <ButtonGroup className="mb-2">
                                    <InputGroup size="sm" className="mb-3">
                                        <InputGroup.Text id="movePitch" >Feed Pitch</InputGroup.Text>
                                        <FormControl aria-label="Small" aria-describedby="inputGroup-sizing-sm"
                                            inputMode='decimal' step='any' type="number"
                                            placeholder={(nvConfig.metric == "true") ? mp : ip}
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
                            Pitch {config.pitch}
                        </span>
                        <span>
                            this pitch: {pitch}
                        </span>
                        {!stats.pos_feed &&
                            <Button>
                                Configure Presets
                            </Button>
                        }

                    </Col>
                </Row>
                <Row>
                    <Col>
                        {!stats.pos_feed &&
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
