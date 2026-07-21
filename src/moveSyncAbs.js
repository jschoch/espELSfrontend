//#use react and stuff
// Depricated 1/16/24
/*
import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { Form, InputGroup, Col, Grid, Row } from 'react-bootstrap';

import { useForm } from 'react-hook-form';
import { send } from './util.js';

export default function MoveSyncAbs({ config, stats, ws }) {
  const { register, handleSubmit, watch, errors } = useForm();

  const onSubmitAbsSyncMove = (data) => {
    console.log("moveSyncAbs submit clicked", data)
    var c = config;
    //c.f = feedingLeft;

    // TODO: make this configurable
    //c.s = data.syncStart;

    moveSyncAbs(data.move_sync_abs_mm);
  }

  function moveSyncAbs(pos) {
    console.log("moveSyncAbs pos", pos)
    var d = { cmd: "moveSyncAbs", config: config }
    d.config.ja = pos;
    console.log("ws", d, config, ws);
    //ws.send(JSON.stringify(d));
    send(d, ws);
  }

  return (
    <div>
      <h5> Absolute </h5>
      <Form inline onSubmit={handleSubmit(onSubmitAbsSyncMove)} onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }} >
        <Row>
          <Col xs={8}>
            <InputGroup.Prepend className="inputGroup-sizing-sm">
              <InputGroup.Text>Position(mm)</InputGroup.Text>
              <Form.Control id="move_sync_abs_mm" name="move_sync_abs_mm" type="number"
                ref={register({ required: true })}
                inputMode='decimal' step='any' defaultValue={Math.abs(config.ja)} />

            </InputGroup.Prepend>
          </Col>
          <Col>
            <Button type="submit" className="mb-2"
              disabled={stats.pos_feed}
            >
              Go
            </Button>
          </Col>
        </Row>
      </Form>
    </div>

  )
}

*/
