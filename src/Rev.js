import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { ArrowBarLeft, ArrowLeft, ArrowRight,ArrowBarRight } from 'react-bootstrap-icons';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ModalJog from './ModalJogSettings.js';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Feeding from './Feeding.js';
import Bounce from './Bounce.js';




export default function Rev({config,me,ws,stats,jogcancel}){

    const [revOff,setRevOff] = useState(0);
    const revSet = () => {
        setRevOff(Math.floor(stats.encoderPos/2400));
    }
    return(
        <span>
            rev {(stats.encoderPos / 2400) - revOff}
            <button type="button" className="btn btn-outline-dark spaceBtn" id="ljog" 
                    onClick={() => revSet()}> 
                    Rev Cnt Zero
                </button>
        </span>
    );

};
