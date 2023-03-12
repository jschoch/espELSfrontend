import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { send, stepsToDistance,mmOrImp } from './util.js';

export default function Moving({ config, stats, nvConfig }) {
  function moveCancel() {
    var d = { cmd: "moveCancel" };
    //ws.send(JSON.stringify(d));
    send(d, window.wsclient);
  }
  return (
    <div>
      {
        // stats sw is syncwaiting
        stats["sw"] &&
        <div>
          <Button variant="danger">Waiting for Sync</Button>
          <Button variant="danger" onClick={moveCancel}>
            Cancel Move!
          </Button>
        </div>
      }

      {stats["pos_feed"] && !stats["sw"] &&
        <div>
           { config.m == "6"  && 
            <div>
              Bounce: {stats.rap? "Rapid Mode" : "Moving Mode"}
            </div>
            
            }
          <Button disabled={stats.pos_feed} >
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />            
           
            {stats.fd &&
              <span>
                Distance to Go: {stepsToDistance(nvConfig, (stats.sp - stats.p)).toFixed(4)}
                {mmOrImp(nvConfig)}
              </span>}
            {!stats.fd &&
              <span>
                -Distance to Go: {stepsToDistance(nvConfig, (stats.p - stats.sn)).toFixed(4)}
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
