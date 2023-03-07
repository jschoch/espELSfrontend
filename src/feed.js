
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
//import Card from "react-boostrap/Card";

export default function Feed({ config }) {




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
                    <Button>
                        Turn On
                    </Button>
                    <Button>
                        Configure
                    </Button>
                </Col>
                <Col className="xs4">
                    <span>
                        Current Config:
                    </span>
                    <span>
                        Pitch {config.pitch}
                    </span>

                </Col>
            </Row>

        </div>
    )
}
