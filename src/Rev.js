import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';





export default function Rev({ stats }) {

    const [revOff, setRevOff] = useState(0);
    const revSet = () => {
        setRevOff(Math.floor(stats.encoderPos / 2400));
    }
    return (
        <span>
            rev {(stats.encoderPos / 2400).toFixed(4) - revOff}
            <Button type="button" id="lwtf"
                variant="outline-warning"
                size="sm"
                onClick={() => revSet()}>
                Rev Cnt Zero
            </Button>
        </span>
    );

};
