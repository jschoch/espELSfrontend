import logo from './logo.svg';
import './App.css';
import React, { Component, useState, useEffect } from 'react';
import {useForm} from 'react-hook-form';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

const modes = {
  0: "Startup",
  1: "Configure",
  2: "Staus",
  3: "Ready",
  4: "Feeding",
  5: "Slave Jog Ready",
  6: "Debug"
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
    console.log("select data",data);
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
        onInput=""
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
                DRO: 0.0
              </span>
              <span>
                Mode: {modes[config.m]}
              </span>
              </div>
      </div>
      <div className="card-body">
              <div className="card-title">
                <form onSubmit={handleSubmit(onSubmitPitch)}>
                Pitch: <input className="form-control" name="pitch" type="text" defaultValue={config.pitch}
                  ref={register({ required: true })}
                  /> 
                <label for="customRange1" className="form-label">Pitch</label>
                <input type="range" className="form-range" id="pitchRange" defaultValue={config.pitch} step="0.1" />
                <input className="btn btn-primary" type="submit" />
                </form>
                
                <form onSubmit={handleSubmit(onSubmitRapid)}>
                <div className="row row-cols-lg-auto g-3 align-items-center">
                <div className="col-12">
                 <RangeSlider name="Range" defaultValue={config.rapid} register={register} /> 
                </div>

                </div>
                </form>
              </div>
              <div className="dropdown">
                <button type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                  Mode: Slave
                </button>
                <div className="dropdown-menu">
                  <a className="dropdown-item" href="#">Slave</a>
                  <a className="dropdown-item" href="#">Slave Jog</a>
                  <a className="dropdown-item" href="#">To and Fro</a>
                </div>
              </div>



              <p className="card-text">

              ...</p>

            </div>
      <DropdownButton
      alignRight
      title="Dropdown right"
      id="dropdown-menu-align-right"
      onSelect={handleSelect}
    
        >
              <Dropdown.Item eventKey="option-1">option-1</Dropdown.Item>
              <Dropdown.Item eventKey="option-2">option-2</Dropdown.Item>
              <Dropdown.Item eventKey="option-3">option 3</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item eventKey="some link">some link</Dropdown.Item>
      </DropdownButton>
      <div><pre>{JSON.stringify(config, null, 2) }</pre></div>
    </div>
  );
}

const RangeSlider = (props) => {

  const [rangeval, setRangeval] = useState(props.defaultValue);

  return (
    <div>
      <input type="text" value={rangeval} 
        onChange={(event) => setRangeval(event.target.value)}
        name="rapid"
        ref={props.register({ required: true })}
      />
      <input type="range" className="custom-range" min=".5" max="5" 
       step="0.1"
       defaultValue={props.defaultValue}
       onChange={(event) => setRangeval(event.target.value)} />
      <span>{props.name}: {rangeval}</span>
      <span className="col-12">
        <input className="btn btn-primary" type="submit" value={`Submit ${props.name}`} />
      </span>
    </div>
  );
};
