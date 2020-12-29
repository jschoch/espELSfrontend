import './App.css';
import { encode, decode,decodeAsync } from "@msgpack/msgpack";
import Info from './info.js';
import React, { Component, useState, useEffect } from 'react';
import {useForm} from 'react-hook-form';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import {Form, InputGroup} from 'react-bootstrap';
import FormControl from 'react-bootstrap/FormControl';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Modal from 'react-bootstrap/Modal';
import useCookie from "./useCookie";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Spinner from 'react-bootstrap/Spinner';

const modes = {
  0: "Startup",
  1: "Slave Ready",
  2: "Slave Jog Ready",
  3: "Debug Ready",
  4: "Running"
};

//var stats = {};

async function decodeFromBlob(blob: Blob): unknown {
  if (blob.stream) {
    // Blob#stream(): ReadableStream<Uint8Array> (recommended)
    return await decodeAsync(blob.stream());
  } else {
    // Blob#arrayBuffer(): Promise<ArrayBuffer> (if stream() is not available)
    return decode(await blob.arrayBuffer());
  }
}

//function ModalError(props){
const ModalError = ({showModalError, modalErrorMsg, setShowModalError}) => {
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
          <Button variant="secondary" onClick={ () => setShowModalError(false)} >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

var ws = "";
export default function App() {
  const { register, handleSubmit, watch, errors } = useForm();
  const onSubmitPitch = data => {
    var c = config
    c.pitch = data.pitch
    setConfig(c);
    console.log("data",data);
    send();
  }

  const onSubmitJog = (data) => {
    //data.preventDefault();
    //data.stopPropagation();
    //console.log("onsubmit target" ,data.target);
    var c = config
    if(submitButton == 1){
      c.jm = data.jog_mm;
    }else{
      c.jm = Math.abs(data.jog_mm) * -1;
    }
    setConfig(c);
    console.log("onSubmitJog data",data,c);
    jog();
  }

  const handleAddrChange = e => {
    setAddr(e.target.value);
    updateCookie(e.target.value,1000);
  }

  const handleEncClick = data => {
    console.log("debug click",data);
    var d = {cmd: "debug",dir: data};
    ws.send(JSON.stringify(d));
  }

  const onSubmitRapid = data => {
    var c = config
    c.rapid = data.rapid
    setConfig(c);
    console.log("range submit data",data);
    send();
  }
  const onSubmitJogScaler = data => {
    var c = config
    c.sc = data.sc
    setConfig(c);
    console.log("Jog Scaler submit data",data);
    send();
  }

  const handleModeSelect = data => {
    config["m"] = data;
    console.log("select data",data);
    if(config["m"] == 2 || config["m"] == 3){
      //show jog control
      setShowJog(true);
    }else{
      setShowJog(false);
    }
    if(data == 5){
      setModalErrorMsg("Mode not implemented yet");
      setShowModalError(true);
    }
  
    send();
  }

  const handleJogTabSelect = data => {
    console.log("select tab",data);
    if(data == "jog"){

      //setShowJog(true);
      //config["m"] = 3;
      //send();
    }
  }
  //const [addr,setAddr] = useState("ws://elsWS/test");
  //const [addr,setAddr] = useState("ws://192.168.1.93/test");
  const [cookie,updateCookie] = useCookie("url", "ws://192.168.1.93/test");
  const [addr,setAddr] = useState(cookie);
  const [config,setConfig] = useState({});
  const [connected,setConnected] = useState(false);
  const [wsS,setWSS] = useState();
  const [showJog,setShowJog] = useState(false);
  const [showRapid,setShowRapid] = useState(false);
  const [timeout, setTimeout] = useState(250);
  const [dro,setDRO] = useState(0.0);
  const [newstats,setNewstats] = useState(false);
  const [stats, setStats] = useState({});
  const [origin,setOrigin] = useState();
  const [showModalError, setShowModalError] = useState(false);
  const [modalErrorMsg,setModalErrorMsg] = useState("not set");
  const [warnings, setWarnings] = useState([]);
  const [info, setInfo] = useState([]);
  const [submitButton,setSubmitButton] = useState(1);

  useEffect(() => {
    if(!connected){
      console.log(addr,cookie);
      if(cookie != addr){
        
        setAddr(cookie);
      }
      connect();
    }
  },[connected]);
  function inputUpdate(e){
    const {value } = e.target;
    this.setAddr( value);
  }
  function meclick(e){
    if(connected){
      disconnect();
      connect();
    }else{
      connect();
    }
    console.log("doink");
  }
  function disconnect(){
    console.log("WS: ",ws);
    ws.close();
    setConnected(false);
    console.log(ws.readyState);
  }

  function fetch(){
    var d = {cmd: "fetch"};
    ws.send(JSON.stringify(d));
  }

  function jogcancel(){
    var d = {cmd: "jogcancel"};
    ws.send(JSON.stringify(d));
  }

  function send(){
    var d = {cmd: "send",config: config}
    console.log("ws",config,ws);
    if(typeof ws.send !== "undefined"){
      ws.send(JSON.stringify(d));
    }else{
      connect();
    }
  }

  function jog(){
    var d = {cmd: "jog",config: config}
    console.log("ws",config,ws);
    ws.send(JSON.stringify(d));
  }
 
  function connect(){
        ws = new WebSocket(addr);
        var connectInterval;

        // websocket onopen event listener
        ws.onopen = () => {
            console.log("connected websocket main component");

            setConnected(true);

            setTimeout(500); // reset timer to 250 on open of websocket connection 
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
            fetch();
        };

        // websocket onclose event listener
        ws.onclose = e => {
            console.log(
                `Socket is closed. Reconnect will be attempted`,
                e.reason
            );

            connectInterval = setTimeout(check, Math.min(10000, timeout)); //call check function after timeout
        };

        // websocket onerror event listener
        ws.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            ws.close();
            return false;
        };
        ws.onmessage = (message) => {
          //console.log("raw",message,message.origin);
          setOrigin(message.origin);
          
          //console.log(message.data instanceof Blob);
          if(message.data instanceof Blob){
            decodeFromBlob(message.data).then((x) => {
              if("cmd" in x){
                if(x["cmd"] == "status"){
                  setNewstats(!newstats);
                  setStats(x);
                  setDRO(x.pmm);
                  }
                if(x["cmd"] == "log"){
                  console.log("stuff",x); 
                  if(x["level"] == 0){
                    setModalErrorMsg(x["msg"]);
                    setShowModalError(true);
                    }
                  }
                }
              }
            );
          }
          else{
            var inconfig = JSON.parse(message.data);
         
            console.log("config data", inconfig);
            if("u" in inconfig){
              if(config["m"] != inconfig["m"]){
                // do something
              }
              setConfig(inconfig);
            }
          }
          
          return false;
        }
    };
    
  function ping(){
    console.log("sending: ")
    //this.state.ws.send({f: this.state.runs});
    var d = {cmd: "ping",runs: {}};
    ws.send(JSON.stringify(d));
    //this.state.ws.send({f: 1.0});
  }
  
   
  function check(){
        if (!ws || ws.readyState === WebSocket.CLOSED) connect(); //check if websocket instance is closed, if so call `connect` function.
    };


  return(
    <div>
      <div className="card-title">
          <span class="btn-group">
          <span>
            <DropdownButton
            alignRight
            title={`Select Mode: ${modes[config.m]}`}
            id="dropdown-menu-align-right"
            onSelect={handleModeSelect} >
                    <Dropdown.Item eventKey="0">Startup Mode</Dropdown.Item>
                    <Dropdown.Item eventKey="1">Slave Mode</Dropdown.Item>
                    <Dropdown.Item eventKey="2">Slave Jog Mode</Dropdown.Item>
                    <Dropdown.Item eventKey="3">Debug Mode</Dropdown.Item>
                    <Dropdown.Item eventKey="4">Free Jog Mode</Dropdown.Item>
                    <Dropdown.Item eventKey="5">To and Fro Mode</Dropdown.Item>
            </DropdownButton>
          </span>
          <span>
            {
              connected ?
                  <span class="badge bg-success">C</span>
                : <span class="badge bg-danger">Not Connected</span>
            }
          </span>
          <span>
            DRO: <span className="badge bg-warning">{dro}</span>
          </span>
          </span>
 
      </div>
  
    <Tabs defaultActiveKey="home" id="uncontrolled-tab-example" 
    onSelect={handleJogTabSelect}
    transition={false}>
    <Tab eventKey="home" title="Home">
      <div> 
        Connection Status: {
          connected ? 
              <span class="badge bg-success">"True"</span>
            : <span class="badge bg-danger">"False"</span>
          }
      </div>
      <div>
        Welcome!  Select a mode to get started.
      </div>
    </Tab>
    <Tab eventKey="jog" title="Jog" >
    <div>
          
              -- {stats["pos_feed"] ? "Feeding" : "Idle"} --
      <div className="card-body">
          { stats["pos_feed"] &&
            <div>
            <Button disabled={stats.pos_feed} >
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              Jogging
            </Button>
            <Button variant="danger" onClick={jogcancel}>
              Cancel Jog!
            </Button>
            </div>
          }
           { showJog && !stats["pos_feed"] &&
              <Form inline onSubmit={handleSubmit(onSubmitJog)} onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }} >
                <Form.Row>
                <InputGroup className="mb-2 mr-sm-2">
                <Button type="submit" className="mb-2 mr-sm-2" 
                  disabled={stats.pos_feed}
                  onClick={() => setSubmitButton(-1)}>
                  Jog Z- 
                </Button>
                <InputGroup.Prepend className="inputGroup-sizing-sm">
                    <InputGroup.Text>Incremental<br /> Jog mm:</InputGroup.Text>
                     <Form.Control id="jog_mm" name="jog_mm" type="number" 
                      ref={register({ required: true })}
                      inputMode='decimal' step='any' placeholder="1.0" defaultValue="1.0" />
                
                  </InputGroup.Prepend>
                  <Button type="submit" className="mb-2" 
                    disabled={stats.pos_feed}
                    onClick={() => setSubmitButton(1)}>
                    Jog Z+
                  </Button>
                </InputGroup>
                </Form.Row>
              </Form>

           }
          <Button>Absolute Move MM jog here</Button> 
        {config["m"] == 2 && <div>TODO: make sure spindle is going CCW</div> }
      </div>
      <div className="card-body">
                <Form inline onSubmit={handleSubmit(onSubmitPitch)} >
                <InputGroup className="mb-2 mr-sm-2">
                  <InputGroup.Prepend>
                    <InputGroup.Text>Pitch: {config["pitch"]}</InputGroup.Text>
                     <Form.Control id="pitch" name="pitch" type="number"
                      ref={register({ required: true })}
                      defaultValue="0.1"
                      inputMode='decimal' step='any' placeholder="1.0" />
                  </InputGroup.Prepend>
                  <Button type="submit" className="mb-2">
                    Change Pitch!
                  </Button>
                </InputGroup>
              </Form>
             { showRapid && 
              <div>
                <form onSubmit={handleSubmit(onSubmitRapid)}>
                <div className="row row-cols-lg-auto g-3 align-items-center">
                  <div className="col-12">
                   <RangeSlider name="Rapid" defaultValue={config.rapid} register={register} /> 
                  </div>

                </div>
                </form>
                </div>

              }
              { showRapid &&
              <div>
              <Form inline onSubmit={handleSubmit(onSubmitJogScaler)} >
                <InputGroup className="mb-2 mr-sm-2">
                  <InputGroup.Prepend>
                    <InputGroup.Text>Jog Scaler</InputGroup.Text>
                     <Form.Control id="sc" name="sc" type="number"
                      ref={register({ required: true })}
                      defaultValue="0.5"                                                                                                      inputMode='decimal' step='any' placeholder="1.0" />
                  </InputGroup.Prepend>
                  <Button type="submit" className="mb-2">
                    Update Jog Scaler Hack!
                  </Button>
                </InputGroup>
              </Form>
              </div>
              }

              <p className="card-text">
                {config["m"] == 0 &&
                  <h4>
                  Select a mode to get started!
                  </h4>
                }

              </p>

            </div>
      <div>

      </div>
    </div>
    </Tab>
    <Tab eventKey="net" title="Network">
      <label for="mdns">MDNS {cookie.url}</label>
      <form>
      <input className="form-control" type="text"
        name="mdns"
        onChange={handleAddrChange}
        value={addr} />
      </form>
      <div className="btn-group" role="group" >
        <div className="btn btn-primary" type="button" onClick={meclick}>
          Connect
        </div>
        <div className="btn btn-secondary" type="button" onClick={disconnect}>
          Disconnect
        </div>
        <div className="btn btn-secondary" type="button" onClick={ping}>
          Ping
        </div>
        <div className="btn btn-secondary" type="button" onClick={fetch}>
          Fetch
        </div>
      </div>
      <br /> {origin}
    </Tab>
    <Tab eventKey="config" title="Conf">
      - <Info stats={stats} x={newstats} /> -
      <div><pre>{JSON.stringify(config, null, 2) }</pre></div>      
      <div><pre>{JSON.stringify(stats, null, 2) }</pre></div>
    </Tab>
    <Tab eventKey="debug" title="Debug">
      <h2> Fast </h2>
      <Button onClick={() => handleEncClick(0)}>
        Decrement virtual encoder 1 rev
      </Button>
      <Button onClick={() => handleEncClick(1)}>
        Increment virtual encoder 1 rev
      </Button>
      <h2> Slow</h2>
      <Button onClick={() => handleEncClick(2)}>
        Increment virtual encoder 1 tick
      </Button>
      <Button onClick={() => handleEncClick(3)}>
        Decrement virtual encoder 1 tick
      </Button>




    </Tab>
    </Tabs>
    <ModalError showModalError={showModalError} 
        modalErrorMsg={modalErrorMsg} 
        setShowModalError={setShowModalError}
  
    />
    </div>
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
