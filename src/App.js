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
import { send, stepsToDistance, mmOrImp, useEventSource} from './util.js';
import { Asterisk, AppIndicator, Wifi, WifiOff } from 'react-bootstrap-icons';
//import useCookie from './useCookie.js';
import { CookiesProvider,useCookies } from 'react-cookie';

//import {Chart} from 'chart.js';
//import 'chartjs-adapter-luxon';
//import ChartStreaming from 'chartjs-plugin-streaming';

//Chart.register(ChartStreaming);


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
const default_ip = "192.168.100.100"



export default function App() {
  //const { register, handleSubmit, watch, errors } = useForm();

  

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

  const handleCancel = (e)=> {
    e.preventDefault();
    var d = { cmd: "moveCancel" };
    send(d);
  }
  const vsn = "0.0.5";
  const default_moveConfig = {
    "movePitch": 1,
    "rapidPitch": 1.1,
    "accel": 50000,
    "dwell": 1,
    "distance": 1,
    "startSync": true,
    "feeding_ccw": true,
    "moveSteps" : 0,
    "moveSpeed" : 7000,
    "moveSteps" : 0,
    "f": true
  }

  
  const [machineConfig,set_machineConfig] = useState({m: 0});
  const [connected, set_connected] = useState(false);
  const [dro, setDRO] = useState(0.0);
  const [rpm, setRPM] = useState(0);
  const [stats, set_stats] = useState({});
  const [nvConfig, set_nvConfig] = useState({ error: true, motor_steps: 0 });
  const [showModalError, setShowModalError] = useState(false);
  const [modalErrorMsg, setModalErrorMsg] = useState("not set");
  //const [metric_cookie, set_metric_cookie] = useCookie("metric", "true");
  //const [cookie, updateCookie] = useCookie("ip_or_hostname", default_ip );
  const [cookies, setCookie ] = useCookies(['ip_or_hostname','metric']);
  const [ws_url, set_ws_url] = useState("ws://"+cookies.ip_or_hostname+"/els");
  const me = { setModalErrorMsg: setModalErrorMsg, setShowModalError: setShowModalError };
  // espWS setup
  const [sse_source, set_sse_source] = useState();
  const sse_events = useEventSource("http://"+ cookies.ip_or_hostname+ "/events",set_sse_source);
  //const sse_events = null;
  const [msg, set_msg] = useState(null);
  const [vencState, set_vencState] = useState(false);
  const [modetabkey, set_modetabkey] = useState('moveSync_tab');
  const [moveConfig,set_moveConfig] = useState(default_moveConfig);
  
  const [state,set_state] = useState( { 
    nvConfig:  nvConfig,
    stats: stats,
    connected: connected,
    set_connected: set_connected,
    // modal error thingy
    me: me,
    metric: cookies.metric,
    dbg: true,
    vsn: vsn
  });

  // Runs only one time
  useEffect(() => {
    console.log("cookies",cookies);
    if(cookies.ip_or_hostname != default_ip){
      set_ws_url("ws://"+cookies.ip_or_hostname+"/els");
      //sse_events = useEventSource("http://"+ cookie + "/events",set_sse_source);
    }else{
      console.log("using default url",ws_url,cookies.ip_or_hostname);
      //setCookie()
    }
    
  }, []);

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

  // sse events

  useEffect(() => {
    if(sse_events){
    //if(sse_events && sse_events.p){

      setDRO(stepsToDistance(state,nvConfig, sse_events.p));
      setRPM(sse_events.rpm);
      var s = state.stats;
      var merged = {};
      Object.assign(merged, s, sse_events);
      //Object.assign(merged, sse_events,stats);
      //console.log("sse_evnt",merged)
      set_state({
        ...state,
        stats: merged
      }
        );

    }
  },[sse_events]);

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
        setDRO(stepsToDistance(state,nvConfig, msg.p));
        setRPM(msg.rpm);
      }
      else if (msg["t"] == "nvConfig") {
        console.log("got nv configuration", msg);
        //msg.metric = metric;
        set_nvConfig(msg);
      }
      else if (msg["t"] == "state") {
        console.log("updating config", msg);
        set_machineConfig(msg);
        console.log("machineConfig", machineConfig,moveConfig)
      }
      else if(msg["t"] == "moveConfigDoc"){
        console.log("updating moveConfig", msg);
        var mc = moveConfig;
        mc.movePitch = msg.movePitch;
        mc.rapidPitch = msg.rapidPitch;
        //mc.moveDirection = msg.
        mc.accel = msg.accel;
        mc.dwell = msg.dwell;
        set_moveConfig(mc);
      }
      else if (msg["t"] == "log") {
        console.log("stuff", msg);
        if (msg["level"] == 0) {
          if(showModalError){
            // append the new message
            var o = msg["msg"]
            setModalErrorMsg( o + " --- " + modalErrorMsg);
          }else{
            setModalErrorMsg(msg["msg"]);
            setShowModalError(true);
          }
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
    <CookiesProvider>
    <Container fluid>
      <div >
        <Row >
          <Col xs={10} >
            {
              connected ?
                <span className="badge bg-success"><Wifi /> </span>
                : <span className="badge bg-danger"><WifiOff /></span>
            }
            {
              //sse_source.
              (sse_source && sse_source.readyState == 1) ?
              <span><AppIndicator /></span>
              :
              <span><Asterisk /></span>
            }
            DRO: <span className="badge bg-warning">{dro.toFixed(4)} {mmOrImp(state)}</span>
            RPM: <span className="badge bg-info">{rpm.toFixed(4)}</span>
            Ang: <span className="badge bg-dark">{sse_events && 
              ((360/nvConfig.spindle_encoder_resolution) *(sse_events.encoderPos % nvConfig.spindle_encoder_resolution)).toFixed(2)
              }</span>
            <Rev sse_events={sse_events} />
              <span
                className="badge bg-success"
                size="sm"
                onClick={() => { 
                  //set_dbg(!dbg); 
                  set_state({
                    ...state,
                    dbg: !state.dbg});
                  }}>
                Dbg: {state.dbg ? "On" : "Off"}
              </span>
              {state.dbg &&
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
          <Button
            className="w-100"
            onClick={handleCancel}
           variant="danger">
            E-Stop
          </Button>
          </Col>
        <Col>
            <ModeSel 
              handleModeSelect={handleModeSelect} 
              className="w-100"
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

              <ThreadView state={state} 
                moveConfig={moveConfig}
                set_moveConfig={set_moveConfig}
                machineConfig={machineConfig} 
                stats={stats} />

            </Tab>
            <Tab
              tabClassName={(machineConfig.m == "9" || machineConfig.m == "4") ? "" : "d-none"}
              eventKey="hob_tab" title="Hobbing">
              <Hobbing 
                moveConfig={moveConfig}
                set_moveConfig={set_moveConfig}
                machineConfig={machineConfig} 
                set_machineConfig={set_machineConfig} 
                state={state} ></Hobbing>
            </Tab>
            <Tab eventKey="config_tab" title="Conf">

              <ConfigUI state={state} machineConfig={machineConfig} 
                nvConfig={nvConfig} 
                set_state={set_state}
                moveConfig={moveConfig}
                set_moveConfig={set_moveConfig}
                cookies={cookies}
                set_sse_source={set_sse_source}
                setCookie = {setCookie}
                 />
            </Tab>
            <Tab eventKey="net_tab" title="Network">
              <Network
                ws_url={ws_url}
                set_ws_url={set_ws_url}
                cookie={cookies.ip_or_hostname}
                set_sse_source={set_sse_source}
                state={state}
                setCookie={setCookie}
                machineConfig={machineConfig} connected={connected} />

            </Tab>

            <Tab
              tabClassName={state.dbg ? "" : "d-none"}
              eventKey="debug_tab" title="Debug"
              >
                <Debug state={state} 
                  moveConfig={moveConfig}
                  machineConfig={machineConfig} 
                  nvConfig={nvConfig} />
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
                  <ModeSel handleModeSelect={handleModeSelect} modes={modes} machineConfig={machineConfig}></ModeSel>
                </span>
              </div>
            </Tab>
            <Tab eventKey="net_tab" title="Network">
              <Network
                cookie={cookies.ip_or_hostname}
                setCookie={setCookie}
                state={state}
                set_sse_source={set_sse_source}
                ws_url={ws_url}
                set_ws_url={set_ws_url}
                machineConfig={machineConfig} connected={connected} />

            </Tab>
            <Tab eventKey="config_tab" title="Conf">

              <ConfigUI state={state} machineConfig={machineConfig} 
                set_state={set_state}
                moveConfig={moveConfig}
                set_moveConfig={set_moveConfig}
                set_sse_source={set_sse_source}
                cookies={cookies}
                nvConfig={nvConfig} setCookie={setCookie} />
            </Tab>
            <Tab
              tabClassName={state.dbg ? "" : "d-none"}
              eventKey="debug_tab" title="Debug">
                <Debug state={state} machineConfig={machineConfig} nvConfig={nvConfig} />
            </Tab>
          </Tabs>
        </div>
      }
      <EspWS msg={msg} set_msg={set_msg} connected={connected}
        vsn={vsn}
        ws_url={ws_url}
        set_ws_url={set_ws_url}
        set_connected={set_connected} machineConfig={machineConfig} />
      <ModalError showModalError={showModalError}
        modalErrorMsg={modalErrorMsg}
        setShowModalError={setShowModalError}

      />
      <Row>
        <Col>
          {JSON.stringify(sse_events)}
        </Col>
      </Row>
    </Container>
    </CookiesProvider>
  )
};
