import logo from './logo.svg';
import './App.css';
import React, { Component, useState, useEffect } from 'react';
import {useForm} from 'react-hook-form';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

const modes = {
  0: "Startup",
  1: "Slave Ready",
  2: "Slave Jog Ready",
  3: "Debug Ready",
  4: "Running"
};

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

  const onSubmitRapid = data => {
    var c = config
    c.rapid = data.rapid
    setConfig(c);
    console.log("range submit data",data);
    send();
  }

  const handleSelect = data => {
    config["m"] = data;
    console.log("select data",data);
    send();
  }
  //const [addr,config,connected] = useState(0);
  //const [addr,setAddr] = useState("ws://elsWS/test");
  const [addr,setAddr] = useState("ws://192.168.1.93/test");
  const [config,setConfig] = useState({});
  const [connected,setConnected] = useState(false);
  const [wsS,setWSS] = useState();

  useEffect(() => {
    //connect();
  });
  function inputUpdate(e){
    const {value } = e.target;
    this.setAddr( value);
  }
  function meclick(e){
    connect();
    //fetch();
    //
    console.log("doink");
  }
  function disconnect(){
    console.log("WS: ",ws);
    ws.close();
    //this.setConnected(false);
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
 
  function connect(){
  //connect = () => {
        ws = new WebSocket(addr);
        let that = this; // cache the this
        var connectInterval;

        // websocket onopen event listener
        ws.onopen = () => {
            console.log("connected websocket main component");

            //this.setConnected(true);

            //that.timeout = 250; // reset timer to 250 on open of websocket connection 
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
            fetch();
        };

        // websocket onclose event listener
        ws.onclose = e => {
            console.log(
                `Socket is closed. Reconnect will be attempted`,
                e.reason
            );

            //connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
        };

        // websocket onerror event listener
        ws.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            //ws.close();
            return false;
        };
        ws.onmessage = (message) => {
          var inconfig = JSON.parse(message.data);
          console.log("config data", inconfig);
          if("u" in inconfig){
            setConfig(inconfig);
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
        if (!ws || ws.readyState == WebSocket.CLOSED) connect(); //check if websocket instance is closed, if so call `connect` function.
    };


  return(
    <div>
    <div>
      <label for="mdns">MDNS</label>
      <input className="form-control" type="text"
        name="mdns"
        onChange={e => setAddr(e.target.value)}
        value={addr} />
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
      
      </div>
      <div className="card-body">
              <div className="card-title">
              <span>
                DRO: <span className="badge bg-warning">0.0</span>
              </span>
              ---
              <span>
                Mode: <span className="badge bg-light">{modes[config.m]}</span>
              </span>
              </div>
      </div>
      <div className="card-body">
              <div className="card-title">
                <form onSubmit={handleSubmit(onSubmitPitch)}>
                Pitch: 
                <input className="form-control" 
                  inputMode='decimal' type='number'
                  min="0.01" max="3.0" step='any'
                  name="pitch" type="text" defaultValue={config.pitch}
                  ref={register({ required: true })}
                  /> 
                {/*
                <label for="customRange1" className="form-label">Pitch</label>
                <input type="range" className="form-range" id="pitchRange" defaultValue={config.pitch} step="0.1" />
                */}
                <input className="btn btn-primary" type="submit" />
                </form>
                
                <form onSubmit={handleSubmit(onSubmitRapid)}>
                <div className="row row-cols-lg-auto g-3 align-items-center">
                <div className="col-12">
                 <RangeSlider name="Rapid" defaultValue={config.rapid} register={register} /> 
                </div>

                </div>
                </form>
              </div>



              <p className="card-text">

              ...</p>

            </div>
      <DropdownButton
      alignRight
      title="Select Mode:"
      id="dropdown-menu-align-right"
      onSelect={handleSelect}
    
        >
              <Dropdown.Item eventKey="0">Startup Mode</Dropdown.Item>
              <Dropdown.Item eventKey="1">Slave Mode</Dropdown.Item>
              <Dropdown.Item eventKey="2">Slave Jog Mode</Dropdown.Item>
              <Dropdown.Item eventKey="3">Debug Mode</Dropdown.Item>
              <Dropdown.Item eventKey="4">Free Jog Mode</Dropdown.Item>
              <Dropdown.Item eventKey="5">To and Fro Mode</Dropdown.Item>
      </DropdownButton>
      <div><pre>{JSON.stringify(config, null, 2) }</pre></div>
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
