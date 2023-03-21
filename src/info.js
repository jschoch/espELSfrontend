//#use react and stuff
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge'
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {mmOrImp, stepsPerIn,stepsPerMM} from './util.js';

var magic = true;

const KV = (props) => {
  const { k, v } = props;
  return (

    <span className="margin-left">
      <Button variant="primary margin-left">
        {k}<Badge variant="light">{v}</Badge>
        <span className="sr-only"></span>
      </Button>
    </span>

  );
};


export default function Info(props) {

  return (
    <div className="container-fluid">
      <pre>
        {
          /* 
          JSON.stringify(props, null, 2) 
          */
        }</pre>
      {props.state.stats.t && props.moveConfig&&  // check stats has values first
        <div>
          <div className="row">
            <div className="col-md-3">
              <div className="card">
                <h5 className="card-header">
                  Position
                </h5>
                <div className="card-body">
                  <p className="card-text">

                    <KV k="Encoder Pulses" v={props.state.stats.encoderPos} />
                    <KV k="Encoder revolutions" v={(props.state.stats.encoderPos / 2400).toFixed(2)} />
                    <KV k="Tool Position (in steps)" v={props.state.stats.p} />
                    <KV k="Pos Stop" v={props.state.stats.sp.toFixed(3)} />

                    <KV k="Neg Stop" v={props.state.stats.sn.toFixed(3)} />
                    <KV k={"steps per " + mmOrImp(props.state)} v={props.state.metric == "true" ? stepsPerMM(props.nvConfig) : stepsPerIn(props.nvConfig)} />
                    <KV k={"stepper accel"} v={props.machineConfig.a} />
                    <br />
                    { /* yuck <!--  need to add debug stats here
          <KV k="Target Tool Position" v={props.state.stats.targetPos} />
          <KV k="Target MM" v={props.state.stats.targetPosMM.toFixed(4)} />
          <br /> 
          <KV k="delta" v={props.state.stats.delta} />
          
          <KV k="DRO" v={props.state.stats.pmm.toFixed(4)} />
          
          */
                    }
                    <KV k="DRO Pulses" v={props.state.stats.p} />





                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <h5 className="card-header">
                  Flags
                </h5>

                <KV k="jogging(rename) " v={props.state.stats.jogging ? "true" : "false"} />
                <KV k="rapiding " v={props.state.stats.rap ? "true" : "false"} />
                <KV k="Motion On: " v={props.state.stats.pos_feed ? "true" : "false"} />
                <KV k="Feeding_CCW" v={props.moveConfig.feeding_ccw ? "true": "false"} />
                <KV k="Feeding_dir" v={props.state.stats.fd ? "true" : "false"} />
                <KV k="Waiting for Sync" v={props.state.stats.sw ? "true" : "false"} />
                <KV k={props.state.metric == "true" ? "Metric": "Imperial"} v="on" />
                <div className="card-body">
                  <p className="card-text">
                    Card content
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <h5 className="card-header">
                  perf
                </h5>
                <div className="card-body">
                  <span className="card-text">
                    <KV k="CPU0" v={props.state.stats.c0} />
                    <KV k="CPU1" v={props.state.stats.c1} />
                    <KV k="pings" v={props.state.stats.c} />
                    <KV k="free heap" v={props.state.stats.h} />
                    <KV k="used heap" v={props.state.stats.ha} />
                    <KV k="RSSI" v={props.state.stats.r} />
                    <KV k="WS clients connected" v={props.state.stats.cc} />
                    <KV k="enc avg time" v={props.state.stats.at} />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Row>
            <Col>
            <div>raw machine config<pre>{JSON.stringify(props.machineConfig, null, 2)}</pre></div>
            </Col>
            <Col>
            <div>raw moveConfig<pre>{JSON.stringify(props.moveConfig, null, 2)}</pre></div>
            </Col>
            <Col>
            <div>raw stats<pre>{JSON.stringify(props.state.stats, null, 2)}</pre></div>

            </Col>
            <Col>
            <div>raw nvConfig<pre>{JSON.stringify(props.nvConfig, null, 2)}</pre></div>
            </Col>
            
            
            
            
            </Row>
        </div>
      }
    </div>
  );

}
