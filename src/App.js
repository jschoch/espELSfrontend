import './App.css';
import { encode, decode, decodeAsync } from "@msgpack/msgpack";
import Info from './info.js';
import ThreadView from "./ThreadView.js";
import ModeSel from './Mode.js';
import MoveSyncUI from './MoveSyncUI.js';
import Debug from './Debug.js';
import Moving from './Moving.js';
import EspWS from './espWS.js';
import ShowNvConfig from './nvConfig.js';
import MoveSyncAbs from './moveSyncAbs.js';
import Feed from './feed.js';
import React, { Component, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { Form, InputGroup, Col, Grid, Row } from 'react-bootstrap';
import FormControl from 'react-bootstrap/FormControl';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Modal from 'react-bootstrap/Modal';

import ButtonGroup from "react-bootstrap/ButtonGroup";
import Spinner from 'react-bootstrap/Spinner';

import ListGroup from 'react-bootstrap/ListGroup';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Rev from './Rev.js';
import Hobbing from './hobbing.js';
import { send, stepsToDistance, distanceToSteps } from './util.js';
import {Wifi,WifiOff} from 'react-bootstrap-icons';


// TODO: refactor, why so many modes unused here?
//  original intent was to map modes to the YASM states in the firmware

const modes = {
  0: "Startup",
  1: "",
  2: "MoveSyncMode",
  3: "",
  4: "",
  6: "Bounce",
  9: "Hob Ready",
  10: "Hob Running",
  11: "Hob Stop"
};




const ModalError = ({ showModalError, modalErrorMsg, setShowModalError }) => {
  return (
    <>

      <Modal show={showModalError} >
        <Modal.Header closeButton>
          <Modal.Title>ERROR!!!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalErrorMsg}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalError(false)} >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
const RangeSlider = (props) => {

  const [rangeval, setRangeval] = useState(props.defaultValue);

  return (
    <div>
      <input type="range" className="custom-range" min=".5" max="5"
        step="0.1"
        defaultValue={props.defaultValue}
        onChange={(event) => setRangeval(event.target.value)} />
      <span>{props.name}: {rangeval}</span>
      <span className="col-12">
        <input className="btn btn-primary" type="submit" value={`Update ${props.name}`} />
      </span>
    </div>
  );
};

export default function App() {
  const { register, handleSubmit, watch, errors } = useForm();


  const onSubmitPitch = (data) => {
    var c = config
    c.pitch = data.pitch
    setConfig(c);
    console.log("data", data);
    sendConfig();
  }

  const onSubmitNvConfig = (data) => {
    console.log("submit nvdata", data);
    delete data.pitch;
    sendNvConfig(data);
  }



  const handleResetNvConfig = (data) => {
    console.log("resetting config");
    var d = { cmd: "resetNvConfig" };
    //ws.send(JSON.stringify(d));
    send(d);
  }






  const handleModeSelect = data => {
    var c = config
    c.m = data;
    setConfig(c);
    console.log("select data", data);
    if (data == 5) {
      setModalErrorMsg("Mode not implemented yet");
      setShowModalError(true);
    }
    sendConfig();
  }

  // TODO: read up on const function literals vs functions and pick one

  const handleView = (m) => {
    if (m != undefined) {
      console.log("hanlde view: ", m);
      if (m == 2 || m == 3) {
        setShowMove(true);
      } else {
        setShowMove(false);
      }
      if (m == 9 || m == 10 || m == 11) {
        console.log("set hobbing enabled")
      }
    }
  }



  const vsn = "0.0.3";

  const [config, setConfig] = useState({ vsn: vsn });
  const [connected, set_connected] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showRapid, setShowRapid] = useState(false);
  const [timeout, setTimeout] = useState(250);
  const [dro, setDRO] = useState(0.0);
  const [rpm, setRPM] = useState(0);
  const [stats, setStats] = useState({});
  const [nvConfig, setNvConfig] = useState({ error: true, motor_steps: 0 });
  const [origin, setOrigin] = useState();
  const [showModalError, setShowModalError] = useState(false);
  const [modalErrorMsg, setModalErrorMsg] = useState("not set");
  const [feedingLeft, setFeedingLeft] = useState(true);
  const [syncStart, setSyncStart] = useState(true);



  const me = { setModalErrorMsg: setModalErrorMsg, setShowModalError: setShowModalError };




  const [warnings, setWarnings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [submitButton, setSubmitButton] = useState(1);
  const [threadOffset, setThreadOffset] = useState(0.0);
  // espWS setup
  const [msg, set_msg] = useState(null);





  function getNvConfig() {
    var d = { cmd: "getNvConfig" };
    //ws.send(JSON.stringify(d));
    send(d);
  }
  function sendNvConfig(data) {
    data["cmd"] = "setNvConfig";
    //ws.send(JSON.stringify(data));
    send(data);
  }



  function sendConfig() {
    var d = { cmd: "sendConfig", config: config }
    send(d);
  }


  const handleTabSelect = data => {
    console.log("select tab", data);
    if (data == "config_tab") {
      console.log("config_tab selectyed");
      getNvConfig();
    }
  }



  // all the msg handling goes here 
  useEffect(() => {
    //console.log("moar",msg);
    if (msg === null) return;
    if ("t" in msg) {
      if (msg["t"] == "status") {
        setStats(msg);
        setDRO(stepsToDistance(nvConfig, msg.p));
        setRPM(msg.rpm);
      }
      else if (msg["t"] == "nvConfig") {
        console.log("got nv configuration", msg);
        setNvConfig(msg);
      }
      else if (msg["t"] == "state") {
        console.log("updating config", msg);
        setConfig(msg);
        handleView(msg["m"]);
      }
      else if (msg["t"] == "log") {
        console.log("stuff", msg);
        if (msg["level"] == 0) {
          setModalErrorMsg(msg["msg"]);
          setShowModalError(true);
        }
      }
    }
    //}
  }, [msg, set_msg, nvConfig]);


  // TODO: refactor this mess 
  return (
    <div>
      <div >
        <Row >
          <Col>
            <ModeSel handleModeSelect={handleModeSelect} modes={modes} config={config}></ModeSel>
          </Col>
          <Col >
            {
              connected ?
                <span className="badge bg-success"><Wifi /> </span>
                : <span className="badge bg-danger"><WifiOff /></span>
            }
            DRO: <span className="badge bg-warning">{dro}</span>
            RPM: <span className="badge bg-info">{rpm.toFixed(4)}</span>
            <Rev stats={stats} />
          </Col>
        </Row>

      </div>

      <Tabs defaultActiveKey="home" id="uncontrolled-tab-example"
        onSelect={handleTabSelect}
        transition={false}>
        <Tab eventKey="home_tab" title="Home">
          <div>
            Connection Status: {
              connected ?
                <span className="badge bg-success">"True"</span>
                : <span className="badge bg-danger">"False"</span>
            }
          </div>
          <div>
            <span>
              Welcome!  Select a mode to get started.
              <ModeSel handleModeSelect={handleModeSelect} modes={modes} config={config}></ModeSel>
            </span>
          </div>
        </Tab>
        <Tab eventKey="moveSync_tab" title="MoveSync">
          <div>
            <div className="card-body">
              {config["m"] == 0 &&
                <div>

                  Select a mode above
                </div>
              }
              {config["m"] != 0 &&
                <MoveSyncUI
                  config={config} setConfig={setConfig} me={me}
                  nvConfig={nvConfig}
                  stats={stats} sendConfig={sendConfig}
                />
              }
            </div>
          </div>
        </Tab>
        <Tab eventKey="Feed" title="Feed">
          <Feed config={config} />
        </Tab>

        <Tab eventKey="net_tab" title="Network">
          <EspWS msg={msg} set_msg={set_msg} connected={connected} 
            vsn={vsn}
            set_connected={set_connected} config={config} />

        </Tab>
        <Tab eventKey="thread_tab" title="Thread">

          <ThreadView config={config} stats={stats} />

        </Tab>
        <Tab eventKey="config_tab" title="Conf">
          <ShowNvConfig nvConfig={nvConfig} stats={stats} config={config} />
          <div>
            - <Info stats={stats} config={config} nvConfig={nvConfig} /> -
          </div>

        </Tab>
        <Tab eventKey="hob_tab" title="Hobbing">
          <Hobbing config={config} setConfig={setConfig} me={me} stats={stats} ></Hobbing>
        </Tab>
        <Tab eventKey="debug_tab" title="Debug">
          <Debug ></Debug>




        </Tab>
      </Tabs>
      <ModalError showModalError={showModalError}
        modalErrorMsg={modalErrorMsg}
        setShowModalError={setShowModalError}

      />
    </div>
  )
};
