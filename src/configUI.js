
import React, { Component, useState, useEffect, useRef } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import ShowNvConfig from './nvConfig.js';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { send } from './util.js';


export default function ConfigUI({ state, set_state, set_sse_source,machineConfig, nvConfig, cookies,setCookie, moveConfig, set_moveConfig }) {
    const [show_stats_interval, set_show_stats_interval] = useState(false);

    const handleStatsClick = () => {
        console.log("statsclick",cookies);
        set_show_stats_interval(true);
    }

    const stats_interval_close = () => {
        set_show_stats_interval(false);
        console.log("closed stats interval");
    }

    const handleSelectStats = (e) => {
        var c = { cmd: "update_stats_interval", value: parseInt(e) }
        console.log("event", e, c);
        send(c)
    }

    return (
        <div>
            <hr />
            <Tabs defaultActiveKey="UIsettings" id="configtabs" className="mb-3">
                <Tab eventKey="UIsettings" title="Settings">
                    working UISettings
                    <Row>
                        <Col>
                            <ButtonGroup>
                                <Button
                                    variant="info"
                                    onClick={handleStatsClick}
                                >
                                    Stats Interval

                                </Button>

                                <Button onClick={(e) => {
                                    e.preventDefault();
                                    var m_string = "true";
                                    if (state.metric == "true") {
                                        m_string = "false"
                                    }
                                    set_state({
                                        ...state,
                                        metric: m_string
                                    });
                                    
                                    state.metric == "true" ? setCookie("metric","false") : setCookie("metric","true")

                                }
                                }>

                                    Units Toggle: {state.metric == "true" ? "Metric" : "Imperial"}
                                </Button>
                                <Button>
                                    Debug: {state.dbg ? "On" : "Off"}
                                </Button>
                            </ButtonGroup>

                        </Col>
                        <Col>
                                <h1> workin progress</h1>
                                <ButtonGroup>

                                
                            <Button>
                                Keep Alive Interval

                            </Button>

                            <Button>
                                Debug Stats Toggle
                            </Button>
                            <Button>
                                Debug Interval
                            </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="nvConfig" title="NV Config">
                    <ShowNvConfig nvConfig={nvConfig} state={state} machineConfig={machineConfig} />

                </Tab>
            </Tabs>
            {state.dbg &&
                <div>
                    <span> metric cookie: {cookies ? cookies.metric : "Null"} ip or host: {cookies ?cookies.ip_or_hostname : "null"} </span>
                    <div>raw config<pre>{JSON.stringify(machineConfig, null, 2)}</pre></div>
                    <div>raw nvConfig<pre>{JSON.stringify(nvConfig, null, 2)}</pre></div>
                </div>
            }

            <Modal show={show_stats_interval} onHide={stats_interval_close}>
                <Modal.Header closeButton>
                    <Modal.Title>Stats Interval Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Dropdown
                        onSelect={handleSelectStats}>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            Select Stats Update Speed
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item eventKey="100">10 updates per second</Dropdown.Item>
                            <Dropdown.Item eventKey="200">5 updates per second</Dropdown.Item>
                            <Dropdown.Item eventKey="500">2 updates per second</Dropdown.Item>
                            <Dropdown.Item eventKey="1000">1 updates per second</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Modal.Body>
            </Modal>
        </div>

    )
}
