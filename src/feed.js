
import React, { useState } from 'react';
import { Button, ToggleButton, ButtonGroup } from 'react-bootstrap';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { send } from './util.js';
//import Card from "react-boostrap/Card";

export default function Feed({ config,nvConfig }) {

    const [pitch, set_pitch] = useState(config.pitch);
    const [reverse, set_reverse] = useState(false);
    const handleToggle = (data) => {
        console.log(data, pitch, reverse);
        var c = config;
        c.f = !reverse;
        c.pitch = parseFloat(pitch);
        var d = { cmd: "feed", config: c};
        send(d);
    };

    const mp = config.pitch;
    const ip = (config.pitch * (1/25.4)).toFixed(4);


    return (
        <div>
            <Row>
                <Col className="xs12">
                    <span>
                        <h5>
                            Help:
                        </h5>
                        <p>
                            : This sets Full Time Feed mode.  Moves with spindle all the time.  Requires use of half nut or toggling spindle on/off
                        </p>
                    </span>
                    <hr />
                </Col>
            </Row>

            <Row>

                <Col className="xs4">
                    <ButtonGroup className="mb-4">
                        <Button onClick={() => { handleToggle("foo"); }}>
                            Turn On
                        </Button>
                    </ButtonGroup>
                    <ButtonGroup className="mb-2">
                        <Button>
                            Configure
                        </Button>
                        <Button>
                            Presets
                        </Button>
                    </ButtonGroup>
                    <ButtonGroup>
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

            </Col>
        </Row>

        </div >
    )
}
