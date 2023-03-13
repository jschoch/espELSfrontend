import './App.css';
import { encode, decode, decodeAsync } from "@msgpack/msgpack";

import ThreadView from "./ThreadView.js";
import ModeSel from './Mode.js';
import MoveSyncUI from './MoveSyncUI.js';
import Debug from './Debug.js';
import EspWS from './espWS.js';
import Feed from './feed.js';
import ConfigUI from './configUI.js'
import Network from './Network.js'
import React, { Component, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { Form, InputGroup, Col, Grid, Row,Container } from 'react-bootstrap';
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
import { send, stepsToDistance, mmOrImp, distanceToSteps } from './util.js';
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
    var c = machineConfig;
    c.m = data;
    set_machineConfig(c)
    console.log("select data", data);
    if (data == 5) {
      setModalErrorMsg("Mode not implemented yet");
      setShowModalError(true);
    }
    sendConfig();
    if(data == 2){
      set_modetabkey("moveSync_tab");
    }
    if(data == 14){
      set_modetabkey("feed_tab");
    }
  }


  const vsn = "0.0.3";


  // Depricate
  const [config, setConfig] = useState({ vsn: vsn });

  const [machineConfig,set_machineConfig] = useState({m: 0});
  const [connected, set_connected] = useState(false);
  const [dro, setDRO] = useState(0.0);
  const [rpm, setRPM] = useState(0);
  const [stats, set_stats] = useState({});
  const [nvConfig, set_nvConfig] = useState({ error: true, motor_steps: 0 });
  const [showModalError, setShowModalError] = useState(false);
  const [modalErrorMsg, setModalErrorMsg] = useState("not set");
  const [dbg, set_dbg] = useState(true);
  const [metric, set_metric] = useCookie("metric", "true");
  const [cookie, updateCookie] = useCookie("url", default_ws_url);
  const [ws_url, set_ws_url] = useState(cookie);
  const me = { setModalErrorMsg: setModalErrorMsg, setShowModalError: setShowModalError };
  // espWS setup
  const [msg, set_msg] = useState(null);
  const [vencState, set_vencState] = useState(false);
  const [modetabkey, set_modetabkey] = useState('moveSync_tab');
  const [moveConfig,set_moveConfig] = useState({});
  const [state,set_state] = useState( { 
    nvConfig:  nvConfig,
    stats: stats,
    connected: connected,
    set_connected: set_connected,
    // modal error thingy
    me: me,
    vsn: vsn
  });


  const handleVenc = (data) => {
    var c = {};
      if(vencState){
        c.encSpeed = 0;
        set_vencState(false);
      }else{
        c.encSpeed = 1;
        set_vencState(true);
      }
      var d = { cmd: "updateEncSpeed", config: c }
      send(d);
  
  }

  function sendConfig() {
    var d = { cmd: "sendConfig", config: machineConfig}
    send(d);
  }

  const handleTabSelect = (key)=> {
    console.log("select tab", key);
    set_modetabkey(key);
    if (key== "config_tab") {
      // what is this?
    }
  }

  // yuck
  const cookie_setters = {
    metric: (val) => {
      console.log("toggle metric", val);
      var nv = nvConfig;
      nv.metric = val;
      set_metric(val, 1000);
      set_nvConfig(nv);
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
        set_state( {
            ...state,
            stats: merged
          })
        setDRO(stepsToDistance(nvConfig, msg.p));
        setRPM(msg.rpm);
      }
      else if (msg["t"] == "nvConfig") {
        console.log("got nv configuration", msg);
        msg.metric = metric;
        set_nvConfig(msg);
      }
      else if (msg["t"] == "state") {
        console.log("updating config", msg);
        //msg.vsn = vsn;
        msg.dbg = dbg;
        set_machineConfig(msg);
        var mc = moveConfig;
        mc.movePitch = msg.pitch;
        mc.rapidPitch = msg.rapid;
        set_moveConfig(mc);
        console.log("machineConfig", machineConfig,moveConfig)
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
  }, [msg, set_msg, nvConfig, set_nvConfig, dro, setDRO]);


  return (
    <Container fluid>
      <div >
        <Row >
          <Col xs={10} >
            {
              connected ?
                <span className="badge bg-success"><Wifi /> </span>
                : <span className="badge bg-danger"><WifiOff /></span>
            }
            DRO: <span className="badge bg-warning">{dro.toFixed(4)} {mmOrImp(nvConfig)}</span>
            RPM: <span className="badge bg-info">{rpm.toFixed(4)}</span>
            <Rev state={state} />
              <span
                className="badge bg-success"
                size="sm"
                onClick={() => { set_dbg(!dbg); var c = machineConfig; c.dbg = !c.dbg; setConfig(c) }}>
                Dbg: {dbg ? "On" : "Off"}
              </span>
              {dbg &&
                <span 
                 onClick={() => {handleVenc()}}
                className="badge bg-danger">
                  venc {vencState ? "On" : "Off"}
                </span>
              }
          </Col>
        </Row>
        <Row>
        <Col>
            <ModeSel 
              handleModeSelect={handleModeSelect} 
              modes={modes} 
              machineConfig={machineConfig}></ModeSel>
          </Col>
        </Row>

      </div>
      {
        //  only disply when we are not in startup mode
        machineConfig.m != 0 &&
        <div>
          <Tabs
            defaultActiveKey="moveSync_tab"
            activeKey={modetabkey}
            id="uncontrolled-tab-example"
            onSelect={(key) => handleTabSelect(key)}
            transition={false}>

            <Tab
              tabClassName={(machineConfig.m == "2" || machineConfig.m == "4" || machineConfig.m == "6") ? "" : "d-none"}
              eventKey="moveSync_tab" title="MoveSync">
              <div>
                <div className="card-body">
                  {machineConfig.m == 0 &&
                    <div>

                      Select a mode above
                    </div>
                  }
                  {machineConfig.m != 0 &&
                    <MoveSyncUI
                      state={state}
                      nvConfig={nvConfig}
                      machineConfig={machineConfig}
                      moveConfig={moveConfig}
                      set_moveConfig={set_moveConfig}
                      set_machineConfig={set_machineConfig}
                    />
                  }
                </div>
              </div>
            </Tab>


            <Tab
              tabClassName={(machineConfig.m == "14" || machineConfig.m == "4") ? "" : "d-none"}
              eventKey="feed_tab" title="Feed">
              <Feed 
                state={state} 
                moveConfig={moveConfig}
                set_moveConfig={set_moveConfig}
                machineConfig={machineConfig} nvConfig={nvConfig}  />
            </Tab>



            <Tab
              tabClassName={(machineConfig.m == "15" || machineConfig.m == "4") ? "" : "d-none"}
              eventKey="thread_tab" title="Thread">

              <ThreadView config={config} stats={stats} />

            </Tab>
            <Tab
              tabClassName={(machineConfig.m == "9" || machineConfig.m == "4") ? "" : "d-none"}
              eventKey="hob_tab" title="Hobbing">
              <Hobbing config={config} setConfig={setConfig} me={me} stats={stats} ></Hobbing>
            </Tab>
            <Tab eventKey="config_tab" title="Conf">

              <ConfigUI stats={stats} config={config} nvConfig={nvConfig} cookie_setters={cookie_setters} />
            </Tab>
            <Tab eventKey="net_tab" title="Network">
              <Network
                ws_url={ws_url}
                set_ws_url={set_ws_url}
                cookie={cookie}
                updateCookie={updateCookie}
                config={config} connected={connected} />

            </Tab>

            <Tab
              tabClassName={dbg ? "" : "d-none"}
              eventKey="debug_tab" title="Debug"
              >
                <Debug state={state} machineConfig={machineConfig} nvConfig={nvConfig} />
            </Tab>
          </Tabs>

        </div>
      }
      {
        // Startup mode home
        (machineConfig.m == undefined || machineConfig.m == 0) &&
        <div>
          <Tabs defaultActiveKey="home_tab" id="uncontrolled-tab-example"
            onSelect={(key) => handleTabSelect(key)}
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
            <Tab eventKey="config_tab" title="Conf">

              <ConfigUI stats={stats} config={config} nvConfig={nvConfig} cookie_setters={cookie_setters} />
            </Tab>
            <Tab
              tabClassName={dbg ? "" : "d-none"}
              eventKey="debug_tab" title="Debug">
                <Debug state={state} machineConfig={machineConfig} nvConfig={nvConfig} />
            </Tab>
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
    </Container>
  )
};
