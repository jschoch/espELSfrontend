import React, { Component, useState, useEffect } from 'react';
import { Form, InputGroup, Col, Grid, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { machine } from 'os';




export default function ModeSel({ modes, machineConfig, handleModeSelect }) {
  return (
    <Row>
      {
        //machineConfig.m &&
        (machineConfig && machineConfig.hasOwnProperty('m')) &&
          <Col>
            <div className="d-grid gap-1">
              <DropdownButton
                className="ms-auto"
                title={`Selected Mode: (${machineConfig.m ? 1 : 2}) 
          ${modes[machineConfig.m]}`}
                id="dropdown-menu-align-right"
                onSelect={handleModeSelect} >

                <Dropdown.Item eventKey="0">Startup Mode</Dropdown.Item>
                <Dropdown.Item eventKey="14"> Feed Mode </Dropdown.Item>
                <Dropdown.Item eventKey="2">Move Sync Mode</Dropdown.Item>
                <Dropdown.Item eventKey="9">Hobbing Mode</Dropdown.Item>

              </DropdownButton>
            </div>
      </Col>
      }

    </Row >
    
  )
}
