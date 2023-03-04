import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import {send} from './util.js';

export default function Moving({stats,ws}){
    function moveCancel(){
      var d = {cmd: "moveCancel"};
      //ws.send(JSON.stringify(d));
      send(d,ws);
    }
    return(
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
                    Distance to Go: {(stats.sp - stats.pmm).toFixed(4)}
                </span>}
              {!stats.fd && 
                <span>
                Distance to Go: {(stats.pmm - stats.sn).toFixed(4)}
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
