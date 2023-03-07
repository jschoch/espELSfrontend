import React, { Component, useState, useEffect } from 'react';





export default function Rev({ stats }) {

    const [revOff, setRevOff] = useState(0);
    const revSet = () => {
        setRevOff(Math.floor(stats.encoderPos / 2400));
    }
    return (
        <span>
            rev {(stats.encoderPos / 2400) - revOff}
            <button type="button" className="btn btn-outline-dark spaceBtn" id="lwtf"
                onClick={() => revSet()}>
                Rev Cnt Zero
            </button>
        </span>
    );

};
