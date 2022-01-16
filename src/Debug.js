import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';

export default function Debug({handleEncClick,encSpeed,updateEncSpeed}){

    return(
        <div>
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
      <div>
          <h3>Virtual Spindle Speed</h3>
      <input type="range" className="custom-range" min="0" max="500" 
       step="1"
       defaultValue={encSpeed}
       onMouseUp={(event) => updateEncSpeed(event.target.value)} />
      <span>Speed: {encSpeed} <input value={encSpeed} onChange={(e) => updateEncSpeed(e.target.value) }></input></span>
      <span className="col-12">
      </span>
    </div>
        </div>

    )
}