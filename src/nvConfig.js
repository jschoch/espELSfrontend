
import React, { Component, useState, useEffect,useRef } from 'react';
import Button from 'react-bootstrap/Button';
import { Form, InputGroup, Col, Grid, Row } from 'react-bootstrap';
import FormControl from 'react-bootstrap/FormControl';
import { send } from './util.js';

export default function ShowNvConfig({ nvConfig, state, machineConfig }) {
    //const { register, handleSubmit, watch, errors } = useForm();
    const lspRef = useRef();
    const microstepsRef = useRef();
    const spindleEncoderRef = useRef();

    const submitNvClick = (data) => {
        data.preventDefault()
        console.log("submit nvdata",data);
        // data should ovveride any conflicts 
       
        var nv = nvConfig;
        //Object.assign(merged,data,nv);
        nv.microsteps = parseInt(microstepsRef.current.value);
        nv.spindle_encoder_resolution = parseInt(spindleEncoderRef.current.value);
        nv.lead_screw_pitch = parseFloat(lspRef.current.value);
        var d = {cmd: "setNvConfig",config: nv};
        console.log(d);
        send(d);
      }

    const resetNv = (data) => {
        data.preventDefault()
        console.log("resetting config");
        var d = {cmd: "resetNvConfig"};
        //ws.send(JSON.stringify(d));
        send(d);
      }


    return (

        <div>
            <div className="row">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            NV Config
                        </div>
                        <div className="card-body">
                            <Form inline >
                                <Row>
                                    <InputGroup className="mb-2 mr-sm-2">
                                        <Col xs={8}>
                                            <InputGroup>
                                                <InputGroup.Text>Lead Screw Pitch (in mm) {nvConfig["lead_screw_pitch"]}</InputGroup.Text>
                                                <Form.Control id="lead_screw_pitch" name="lead_screw_pitch" type="number"
                                                    required
                                                    defaultValue={nvConfig["lead_screw_pitch"]}
                                                    ref={lspRef}
                                                    inputMode='decimal' step='any' placeholder={nvConfig["lead_screw_pitch"]} />

                                            </InputGroup>
                                            <InputGroup>
                                                <InputGroup.Text>Micro Steps {nvConfig["microsteps"]}</InputGroup.Text>
                                                <button type="button" className="btn btn-secondary" data-toggle="tooltip" title="this is the microstepping mutliplier 1,2,4,8,16 etc">?</button>
                                                <Form.Control id="microsteps" name="microsteps" type="number"
                                                    required
                                                    ref={microstepsRef}
                                                    defaultValue={nvConfig["microsteps"]}
                                                    inputMode='decimal' step='any' placeholder={nvConfig["microsteps"]} />

                                            </InputGroup>
                                            <InputGroup>
                                                <InputGroup.Text>Spindle Encoder Resolution (CPR) {nvConfig["spindle_encoder_resolution"]}</InputGroup.Text>
                                                <Form.Control id="spindle_encoder_resolution" name="spindle_encoder_resolution" type="number"
                                                    required
                                                    ref={spindleEncoderRef}
                                                    defaultValue={nvConfig["spindle_encoder_resolution"]}
                                                    inputMode='decimal' step='any' placeholder={nvConfig["spindle_encoder_resolution"]} />

                                            </InputGroup>
                                            <InputGroup>
                                                <InputGroup.Text>Encoder Pin A: {nvConfig["EA"]}</InputGroup.Text>
                                                <Form.Control id="EA" name="EA" type="number"
                                                    required
                                                    readOnly
                                                    disabled
                                                    defaultValue={nvConfig["EA"]}
                                                    inputMode='decimal' step='any' placeholder={nvConfig["EA"]} />

                                            </InputGroup>
                                            <InputGroup>
                                                <InputGroup.Text>Encoder Pin B: {nvConfig["EB"]}</InputGroup.Text>
                                                <Form.Control id="EB" name="EB" type="number"
                                                    required
                                                    readOnly
                                                    disabled
                                                    defaultValue={nvConfig["EB"]}
                                                    inputMode='decimal' step='any' placeholder={nvConfig["EB"]} />

                                            </InputGroup>

                                            <InputGroup>
                                                <InputGroup.Text>Motor Steps per revolution {nvConfig["motor_steps"]}</InputGroup.Text>

                                            </InputGroup>
                                            <InputGroup>
                                                <InputGroup.Text>Motor Native Steps {nvConfig["native_steps"]}</InputGroup.Text>

                                            </InputGroup>
                                            <InputGroup>
                                                <InputGroup.Text>Firmware Version {nvConfig["vsn"]}</InputGroup.Text>

                                            </InputGroup>
                                        </Col>

                                        <Col>
                                            <Button type="submit" className="mb-2" onClick={submitNvClick}>
                                                Save Config!
                                            </Button>
                                        </Col>
                                    </InputGroup>
                                </Row>
                            </Form>
                            <Form >
                                <Button 
                                    onClick={resetNv}
                                    type="submit" className="mb-2">
                                    Reset Config to defaults.
                                </Button>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
