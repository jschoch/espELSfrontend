
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import ShowNvConfig from './nvConfig.js';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from 'react-bootstrap/Button';


export default function ConfigUI({stats,config,nvConfig,cookie_setters}){



    return(
        <div>
            <hr />
            <Tabs defaultActiveKey="UIsettings" id="configtabs" className="mb-3">
                <Tab eventKey="UIsettings" title="Settings">
                    UISettings
                    <Row>
                        <Col>

                        <Button onClick={() => {nvConfig.metric == "true" ? cookie_setters.metric("false") : cookie_setters.metric("true")}}>
                            Units Toggle: {nvConfig.metric == "true" ? "Metric" : "Imperial"}
                        </Button>
                        <Button>
                            Debug: {config.dbg ? "On" : "Off"}
                        </Button>
                        </Col>
                        <Col>
                            <Button>
                                Keep Alive Interval
                                
                            </Button>
                            <Button>
                                Stats Interval
                            </Button>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="nvConfig" title="NV Config">
                <ShowNvConfig nvConfig={nvConfig} stats={stats} config={config} />
           
                </Tab>
            </Tabs>
            { config.dbg && 
             <div>
                <div>raw config<pre>{JSON.stringify(config, null, 2)}</pre></div>
                <div>raw nvConfig<pre>{JSON.stringify(nvConfig, null, 2)}</pre></div>
             </div>
            }   
        </div>

    )
}
