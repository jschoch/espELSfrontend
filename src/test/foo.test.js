import { render, screen } from '@testing-library/react';
import React from 'react';
import {stepsPerMM} from '../util.js';

/*describe('App tests', () => {
});
*/
test('why is this single quoted', () =>{
    var nvConfig = {
        lead_screw_pitch: 1,
        motor_steps: 1000
    }
    var x = stepsPerMM(nvConfig,1)
    expect(x).toBe(1000);
}
)
