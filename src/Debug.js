import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { send } from './util.js';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Info from './info.js';

export default function Debug({ state,machineConfig,nvConfig,moveConfig }) {

  const [encSpeed, set_encSpeed] = useState(0);
  const [numTicks, set_numTicks] = useState(10);

  const handleEncClick = data => {
    console.log("debug click", data);
    var d = { cmd: "debug", basic: data };
    send(d);
  }

  function updateEncSpeed(val) {
    set_encSpeed(val);
    var c = {};
    c.encSpeed = val;
    var d = { cmd: "updateEncSpeed", config: c }
    send(d);
  }

  function handleNumTicksClick() {
    console.log("foo", numTicks);
    var d = { cmd: "debug", ticks: numTicks };
    send(d);
  }


  return (
    <div>
      <Tabs defaultActiveKey="state.stats" id="debugTabs">
        <Tab eventKey="venc" title="Virtual Encoder">

        </Tab>
        <Tab eventKey="state.stats" title="state.stats">
                - <Info state={state} machineConfig={machineConfig} nvConfig={nvConfig} moveConfig={moveConfig} /> -
        </Tab>
      </Tabs>
      <h5> Full Revolution</h5>
      <Button onClick={() => handleEncClick(0)}>
        Decrement virtual encoder 1 rev
      </Button>
      <Button onClick={() => handleEncClick(1)}>
        Increment virtual encoder 1 rev
      </Button>
      <h5> Single Encoder Ticks</h5>
      <Button onClick={() => handleEncClick(2)}>
        Increment virtual encoder 1 tick
      </Button>
      <Button onClick={() => handleEncClick(3)}>
        Decrement virtual encoder 1 tick
      </Button>
      <div>
        <h5>Virtual Spindle Speed</h5>
        <span> will run the enconder contstantly at the set speed</span>
        <input type="range" className="custom-range" min="0" max="500"
          step="1"
          defaultValue={encSpeed}
          onMouseUp={(event) => updateEncSpeed(event.target.value)} />
        <span>Speed: {encSpeed} <input value={encSpeed} onChange={(e) => updateEncSpeed(e.target.value)}></input></span>
        <span className="col-12">
          <h5>Move X Ticks</h5>
        </span>
        <div>
          <form>
            Move encoder X ticks
            <input type="text" className="custom-range"
              defaultValue='10'
              onChange={(event) => set_numTicks(event.target.value)} />
            <Button onClick={() => handleNumTicksClick()}>Send Ticks</Button>
          </form>
        </div>
      </div>
    </div>

  )
}
