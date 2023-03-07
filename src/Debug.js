import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { send } from './util.js';

export default function Debug({ ws }) {

  const [encSpeed, set_encSpeed] = useState(0);
  const [numTicks, set_numTicks] = useState(10);

  const handleEncClick = data => {
    console.log("debug click", data);
    var d = { cmd: "debug", basic: data };
    //ws.send(JSON.stringify(d));
    send(d, ws);
  }

  function updateEncSpeed(val) {
    set_encSpeed(val);
    var c = {};
    c.encSpeed = val;
    var d = { cmd: "updateEncSpeed", config: c }
    console.log("ws", d, ws);
    //ws.send(JSON.stringify(d));
    send(d, ws);
  }

  function handleNumTicksClick() {
    console.log("foo", numTicks);
    var d = { cmd: "debug", ticks: numTicks };
    //ws.send(JSON.stringify(d));
    send(d, ws);
  }


  return (
    <div>
      <h2> Full Revolution</h2>
      <Button onClick={() => handleEncClick(0)}>
        Decrement virtual encoder 1 rev
      </Button>
      <Button onClick={() => handleEncClick(1)}>
        Increment virtual encoder 1 rev
      </Button>
      <h2> Single Encoder Ticks</h2>
      <Button onClick={() => handleEncClick(2)}>
        Increment virtual encoder 1 tick
      </Button>
      <Button onClick={() => handleEncClick(3)}>
        Decrement virtual encoder 1 tick
      </Button>
      <div>
        <h3>Virtual Spindle Speed</h3>
        <span> will run the enconder contstantly at the set speed</span>
        <input type="range" className="custom-range" min="0" max="500"
          step="1"
          defaultValue={encSpeed}
          onMouseUp={(event) => updateEncSpeed(event.target.value)} />
        <span>Speed: {encSpeed} <input value={encSpeed} onChange={(e) => updateEncSpeed(e.target.value)}></input></span>
        <span className="col-12">
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
