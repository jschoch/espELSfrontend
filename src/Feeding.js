import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

export default function Feeding({stats,jogcancel}){

    return(
      <div>
        {stats["sw"] &&
          <div>
          <Button variant="danger">Waiting for Sync</Button>
          <Button variant="danger" onClick={jogcancel}>
              Cancel Jog!
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
              {stats.fd && (stats.sp - stats.pmm).toFixed(4)}
              {!stats.fd && (stats.pmm - stats.sn).toFixed(4)}
            </Button>
            <Button variant="danger" onClick={jogcancel}>
              Cancel Jog!
            </Button>
            </div>
            }
      </div>
    )
}