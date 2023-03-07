import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';


export default function ModeSel(props) {
  return (
    <span>
      <DropdownButton
        alignRight
        title={`Selected Mode: ${props.modes[props.config.m]}`}
        id="dropdown-menu-align-right"
        onSelect={props.handleModeSelect} >

        <Dropdown.Item eventKey="0">Startup Mode</Dropdown.Item>
        <Dropdown.Item eventKey="2">Sync Move Mode</Dropdown.Item>
        <Dropdown.Item eventKey="9">Hobbing Mode</Dropdown.Item>

      </DropdownButton>
    </span>
  )
}
