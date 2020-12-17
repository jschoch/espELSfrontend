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
import useCookie from "./useCookie";

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

  const onSubmitJog = data => {
    var c = config
    c.jm = data.jog_mm;
    setConfig(c);
    console.log("data",data,c);
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

  const handleSelect = data => {
    config["m"] = data;
    console.log("select data",data);
    if(config["m"] == 2 || config["m"] == 3){
      //show jog control
      setShowJog(true);
    }else{
      setShowJog(false);
    }
  
    send();
  }

  const handleJogTabSelect = data => {
    console.log("select tab",data);
    if(data == "jog"){

      setShowJog(true);
      //config["m"] = 3;
      send();
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
  const [timeout, setTimeout] = useState(250);
  const [dro,setDRO] = useState(0.0);
  const [newstats,setNewstats] = useState(false);
  const [stats, setStats] = useState({});
  const [origin,setOrigin] = useState();

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

  function send(){
    var d = {cmd: "send",config: config}
    console.log("ws",config,ws);
    ws.send(JSON.stringify(d));
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
            //fetch();
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
              setNewstats(!newstats);
              //console.log("stuff",x);
              //stats = x;
              setStats(x);
              setDRO(x.pmm);
              }
            );;
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
    <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" 
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
      Device Mode: {config["m"]}
      </div>
    </Tab>
    <Tab eventKey="jog" title="Jog" >
    <div>
          
      <div className="card-body">
              <div className="card-title">
              <span>
                DRO: <span className="badge bg-warning">{dro}</span>
              </span>
              ---
              <span>
                Mode: <span className="badge bg-light">{modes[config.m]}</span>
              </span>
              </div>
              { showJog &&
              <Form inline onSubmit={handleSubmit(onSubmitJog)} >
                <InputGroup className="mb-2 mr-sm-2">
                  <InputGroup.Prepend>
                    <InputGroup.Text>Jog mm:</InputGroup.Text>
                     <Form.Control id="jog_mm" name="jog_mm" type="number" 
                      ref={register({ required: true })}
                      inputMode='decimal' step='any' placeholder="1.0" defaultValue="1.0" />
                
                  </InputGroup.Prepend>
                  <Button type="submit" className="mb-2">
                    Do Jog!
                  </Button>
                </InputGroup>
              </Form>
              }
        {config["m"] == 2 && <div>TODO: make sure spindle is going CCW</div> }
      </div>
      <div className="card-body">
                <Form inline onSubmit={handleSubmit(onSubmitPitch)} >
                <InputGroup className="mb-2 mr-sm-2">
                  <InputGroup.Prepend>
                    <InputGroup.Text>Pitch:</InputGroup.Text>
                     <Form.Control id="pitch" name="pitch" type="number"
                      ref={register({ required: true })}
                      defaultValue="0.1"
                      inputMode='decimal' step='any' placeholder="1.0" />
                  </InputGroup.Prepend>
                  <Button type="submit" className="mb-2">
                    Update Pitch!
                  </Button>
                </InputGroup>
              </Form>
                <form onSubmit={handleSubmit(onSubmitRapid)}>
                <div className="row row-cols-lg-auto g-3 align-items-center">
                  <div className="col-12">
                   <RangeSlider name="Rapid" defaultValue={config.rapid} register={register} /> 
                  </div>

                </div>
                </form>
              { showJog &&
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
              }

              <p className="card-text">

              ...</p>

            </div>
      <div>
      <DropdownButton
      alignRight
      title="Select Mode:"
      id="dropdown-menu-align-right"
      onSelect={handleSelect} >
              <Dropdown.Item eventKey="0">Startup Mode</Dropdown.Item>
              <Dropdown.Item eventKey="1">Slave Mode</Dropdown.Item>
              <Dropdown.Item eventKey="2">Slave Jog Mode</Dropdown.Item>
              <Dropdown.Item eventKey="3">Debug Mode</Dropdown.Item>
              <Dropdown.Item eventKey="4">Free Jog Mode</Dropdown.Item>
              <Dropdown.Item eventKey="5">To and Fro Mode</Dropdown.Item>
      </DropdownButton>
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
    <Tab eventKey="config" title="Configuration">
      - <Info stats={stats} x={newstats} /> -
      <div><pre>{JSON.stringify(config, null, 2) }</pre></div>      
      <div><pre>{JSON.stringify(stats, null, 2) }</pre></div>
    </Tab>
    <Tab eventKey="debug" title="Debug Commands">
      <Button onClick={() => handleEncClick(0)}>
        Deccrement virtual encoder 1 rev
      </Button>
      <Button onClick={() => handleEncClick(1)}>
        Increment virtual encoder 1 rev
      </Button>
    </Tab>
    </Tabs>
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
