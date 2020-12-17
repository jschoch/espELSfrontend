//#use react and stuff
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge'

var magic = true;

const KV = (props) => {
  const {k,v} = props;
  return (
<span className="margin-left">
<Button variant="primary margin-left">
  {k}<Badge variant="light">{v}</Badge>
  <span className="sr-only">unread messages</span>
</Button>
</span>
  );
};


export default function Info(props) {

  return (
<div className="container-fluid">
  <pre>{/* JSON.stringify(props, null, 2) */}</pre>
  <div className="row">
    <div className="col-md-3">
      <div className="card">
        <h5 className="card-header">
          Position
        </h5>
        <div className="card-body">
          <p className="card-text">

<KV k="Encoder" v={props.stats.encoderPos} />
<KV k="Tool Position" v={props.stats.tp} />
<br />
<KV k="Target Tool Position" v={props.stats.targetPos} />
<KV k="Calc Spindle Pos" v={props.stats.calcPos} />
<br /> 
<KV k="delta" v={props.stats.delta} />
<KV k="Pos Stop" v={props.stats.sp} />

<KV k="Neg Stop" v={props.stats.sn} />
<KV k="exDelta" v={props.stats.xd} />
<KV k="DRO" v={props.stats.pmm} />
<KV k="DRO Pulses" v={props.stats.p} />


            
          </p>
        </div>
      </div>
    </div>
    <div className="col-md-4">
      <div className="card">
        <h5 className="card-header">
          Flags
        </h5>

<KV k="feeding " v={props.stats.feeding ? "true" : "false"} />
<KV k="jogging " v={props.stats.jogging? "true" : "false"} />
<KV k="jog_done " v={props.stats.jog_dong ? 1 : 0} />
<KV k="Stop Neg Exceeded?" v={props.stats.sne ? "true" : "false" } />
<KV k="Stop Pos Exceeded?" v={props.stats.spe ? "true" : "false" } />
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
          <p className="card-text">
            <KV k="CPU0" v={props.stats.c0} />
            <KV k="CPU1" v={props.stats.c1} />
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
);

}
