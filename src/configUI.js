
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import ShowNvConfig from './nvConfig.js';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';
import { send } from './util.js';


export default function ConfigUI({ state, set_state, machineConfig, nvConfig, cookie_setters, moveConfig, set_moveConfig }) {



    return (
        <div>
            <hr />
            <Tabs defaultActiveKey="UIsettings" id="configtabs" className="mb-3">
                <Tab eventKey="UIsettings" title="Settings">
                    UISettings
                    <Row>
                        <Col>

                            <Button onClick={() => {
                                var m_string = "true";
                                if (state.metric == "true") {
                                    m_string = "false"
                                }
                                set_state({
                                    ...state,
                                    metric: m_string
                                });

                                state.metric == "true" ? cookie_setters.metric("false") : cookie_setters.metric("true")

                                var temp_config = {
                                    ...moveConfig,
                                    movePitch: 0.1,
                                    pitch: 0.1,
                                    rapidPitch: 0.1,
                                    rapid: 0.1
                                }
                                set_moveConfig(temp_config);
                                var d = {cmd: "sendMoveConfig",config: temp_config};
                                send(d);
                            }
                            }>

                                Units Toggle: {state.metric == "true" ? "Metric" : "Imperial"}
                            </Button>
                            <Button>
                                Debug: {state.dbg ? "On" : "Off"}
                            </Button>
                        </Col>
                        <Col>
                            <Button>
                                Keep Alive Interval

                            </Button>
                            <Button>
                                Stats Interval
                            </Button>
                            <Button>
                                Debug Stats Toggle
                            </Button>
                            <Button>
                                Debug Interval
                            </Button>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="nvConfig" title="NV Config">
                    <ShowNvConfig nvConfig={nvConfig} state={state} machineConfig={machineConfig} />

                </Tab>
            </Tabs>
            {state.dbg &&
                <div>
                    <div>raw config<pre>{JSON.stringify(machineConfig, null, 2)}</pre></div>
                    <div>raw nvConfig<pre>{JSON.stringify(nvConfig, null, 2)}</pre></div>
                </div>
            }
        </div>

    )
}
