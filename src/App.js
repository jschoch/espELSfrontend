import './App.css';
import { encode, decode, decodeAsync } from "@msgpack/msgpack";

import ThreadView from "./ThreadView.js";
import ModeSel from './Mode.js';
import MoveSyncUI from './MoveSyncUI.js';
import Debug from './Debug.js';
import Moving from './Moving.js';
import EspWS from './espWS.js';
import ShowNvConfig from './nvConfig.js';
import Feed from './feed.js';
import ConfigUI from './configUI.js'
import Network from './Network.js'
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
import { Wifi, WifiOff } from 'react-bootstrap-icons';
import useCookie from './useCookie.js';


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
  11: "Hob Stop",
  14: "Feed Mode"
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
var default_ws_url = "ws://192.168.100.100/els";
export default function App() {
  const { register, handleSubmit, watch, errors } = useForm();


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


  const vsn = "0.0.3";

  const [config, setConfig] = useState({ vsn: vsn });
  const [connected, set_connected] = useState(false);
  const [dro, setDRO] = useState(0.0);
  const [rpm, setRPM] = useState(0);
  const [stats, set_stats] = useState({});
  const [nvConfig, setNvConfig] = useState({ error: true, motor_steps: 0 });
  const [showModalError, setShowModalError] = useState(false);
  const [modalErrorMsg, setModalErrorMsg] = useState("not set");
  const [dbg, set_dbg] = useState(false);
  const [metric, set_metric] = useCookie("metric", "true");
  const [cookie, updateCookie] = useCookie("url", default_ws_url);
  const [ws_url, set_ws_url] = useState(cookie);
  const me = { setModalErrorMsg: setModalErrorMsg, setShowModalError: setShowModalError };
  // espWS setup
  const [msg, set_msg] = useState(null);

  function getNvConfig() {
    var d = { cmd: "getNvConfig" };
    send(d);
  }
  function sendNvConfig(data) {
    data["cmd"] = "setNvConfig";
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

  // yuck
  const cookie_setters = {
    metric: (val) => {
      console.log("toggle metric", val);
      var nv = nvConfig;
      nv.metric = val;
      set_metric(val, 1000);
      setNvConfig(nv);
    }
  }

  // all the msg handling goes here 
  useEffect(() => {
    //console.log("moar",msg);
    if (msg === null) return;
    if ("t" in msg) {
      if (msg["t"] == "status") {
        // hacky 
        var merged = {}
        Object.assign(merged, stats, msg);
        set_stats(merged);
        setDRO(stepsToDistance(nvConfig, msg.p));
        setRPM(msg.rpm);
      }
      else if (msg["t"] == "nvConfig") {
        console.log("got nv configuration", msg);
        msg.metric = metric;
        setNvConfig(msg);
      }
      else if (msg["t"] == "state") {
        console.log("updating config", msg);
        msg.vsn = vsn;
        msg.dbg = dbg;
        setConfig(msg);
        //handleView(msg["m"]);
      }
      else if (msg["t"] == "log") {
        console.log("stuff", msg);
        if (msg["level"] == 0) {
          setModalErrorMsg(msg["msg"]);
          setShowModalError(true);
        }
      }
      else if (msg["t"] == "dbg_st") {
        var s = stats;
        var merged = {};
        Object.assign(merged, stats, msg);
        set_stats(merged);

      }
      else {
        console.log("unknown msg:", msg)
      }
    }
    //}
  }, [msg, set_msg, nvConfig, setNvConfig, dro, setDRO]);


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
            <div>
              <Button
                size="sm"
                onClick={() => { set_dbg(!dbg); var c = config; c.dbg = !c.dbg; setConfig(c) }}>
                Dbg: {dbg ? "On" : "Off"}
              </Button></div>
          </Col>
        </Row>

      </div>
      {
        //  only disply when we are not in startup mode
        config["m"] != 0 &&
        <div>
          <Tabs defaultActiveKey="home" id="uncontrolled-tab-example"
            onSelect={handleTabSelect}
            transition={false}>

            <Tab
              tabClassName={(config["m"] == "2" || config["m"] == "4" || config["m"] == "6") ? "" : "d-none"}
              eventKey="moveSync_tab" title="MoveSync">
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
                      connected={connected}
                      stats={stats} sendConfig={sendConfig}
                    />
                  }
                </div>
              </div>
            </Tab>


            <Tab
              tabClassName={(config["m"] == "14" || config["m"] == "4") ? "" : "d-none"}
              eventKey="Feed" title="Feed">
              <Feed config={config} nvConfig={nvConfig} />
            </Tab>


            
            <Tab
              tabClassName={(config["m"] == "15" || config["m"] == "4") ? "" : "d-none"}
                eventKey = "thread_tab" title="Thread">

              <ThreadView config={config} stats={stats} />

            </Tab>
            <Tab
              tabClassName={(config["m"] == "9" || config["m"] == "4") ? "" : "d-none"}
              eventKey="hob_tab" title="Hobbing">
              <Hobbing config={config} setConfig={setConfig} me={me} stats={stats} ></Hobbing>
            </Tab>
            <Tab eventKey="config_tab" title="Conf">

              <ConfigUI stats={stats} config={config} nvConfig={nvConfig} cookie_setters={cookie_setters} />
            </Tab>
            <Tab eventKey="net_tab">

            </Tab>
            <Tab eventKey="net_tab" title="Network">
                <Network 
                  ws_url={ws_url}
                  set_ws_url={set_ws_url}
                  cookie={cookie}
                  updateCookie={updateCookie}
                  config={config} connected={connected} />

            </Tab>

            {dbg &&
              <Tab eventKey="debug_tab" title="Debug">
                <Debug stats={stats} config={config} nvConfig={nvConfig} ></Debug>
              </Tab>
            }
          </Tabs>

        </div>
      }
      {
        // Startup mode home
        (config["m"] == undefined || config["m"] == 0) &&
        <div>
          <Tabs defaultActiveKey="home_tab" id="uncontrolled-tab-example"
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
            <Tab eventKey="net_tab" title="Network">
                <Network 
                  cookie={cookie}
                  updateCookie={updateCookie}
                  ws_url={ws_url}
                  set_ws_url={set_ws_url}
                  config={config} connected={connected} />

            </Tab>
            {dbg &&
              <div>
                <Tab eventKey="debug_tab" title="Debug">
                  <Debug stats={stats} config={config} nvConfig={nvConfig} ></Debug>
                </Tab>
              </div>
            }

          </Tabs>
        </div>
      }
      <EspWS msg={msg} set_msg={set_msg} connected={connected}
                vsn={vsn}
                ws_url={ws_url}
                set_connected={set_connected} config={config} />
      <ModalError showModalError={showModalError}
        modalErrorMsg={modalErrorMsg}
        setShowModalError={setShowModalError}

      />
    </div>
  )
};
