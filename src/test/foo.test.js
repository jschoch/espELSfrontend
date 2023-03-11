import { render, screen } from '@testing-library/react';
import React from 'react';
import {stepsPerMM, stepsPerIn, mmOrImp, distanceToSteps, stepsToDistance} from '../util.js';

/*describe('App tests', () => {
});
*/

var nvConfig = {
    lead_screw_pitch: 1,
    motor_steps: 1000,
    metric: "true"
}

var nvConfigIn = {
    lead_screw_pitch: 1,
    motor_steps: 1000,
    metric: "false"
}

test('why is this single quoted', () =>{
   
    var one_mm_in_steps = stepsPerMM(nvConfig,1)
    expect(one_mm_in_steps).toBe(1000);
    var one_in_in_steps = stepsPerIn(nvConfig,1)
    expect(one_in_in_steps).toBe(1000 * 25.4);


    var distance = stepsToDistance(nvConfigIn, one_in_in_steps)

    var t = distanceToSteps(nvConfigIn, distance)

    expect(t).toBe(one_in_in_steps)

    var mmsteps = distanceToSteps(nvConfig, 1)

    expect(mmsteps).toBe(1000)
    
    var t2 = stepsToDistance(nvConfig,mmsteps);
    expect(t2).toBe(1);

    var t3 = mmOrImp(nvConfig)
    expect(t3).toBe("(mm)");

    var t4 = mmOrImp(nvConfigIn);
    expect(t4).toBe("(in)");


}
)
