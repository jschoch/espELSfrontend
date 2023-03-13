import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { send, stepsToDistance,mmOrImp } from './util.js';

export default function Moving({ state,nvConfig,machineConfig }) {
  function moveCancel() {
    var d = { cmd: "moveCancel" };
    send(d);
  }
  return (
    <div>
      {
        // stats sw is syncwaiting
        state.stats["sw"] &&
        <div>
          <Button variant="danger">Waiting for Sync</Button>
          <Button variant="danger" onClick={moveCancel}>
            Cancel Move!
          </Button>
        </div>
      }

      {state.stats["pos_feed"] && !state.stats["sw"] &&
        <div>
           { machineConfig.m == "6"  && 
            <div>
              Bounce: {state.stats.rap? "Rapid Mode" : "Moving Mode"}
            </div>
            
            }
          <Button disabled={state.stats.pos_feed} >
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />            
           
            {state.stats.fd &&
              <span>
                Distance to Go: {stepsToDistance(nvConfig, (state.stats.sp - state.stats.p)).toFixed(4)}
                {mmOrImp(nvConfig)}
              </span>}
            {!state.stats.fd &&
              <span>
                -Distance to Go: {stepsToDistance(nvConfig, (state.stats.p - state.stats.sn)).toFixed(4)}
                {mmOrImp(nvConfig)}
              </span>

            }
          </Button>
          <Button variant="danger" onClick={moveCancel}>
            Cancel Move!
          </Button>
        </div>
      }
    </div>
  )
}
