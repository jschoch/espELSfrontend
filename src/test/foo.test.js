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


var state = {
    metric: "true"
}

var stateIn = {
    metric: "false"
}

test('why is this single quoted', () =>{
   
    var one_mm_in_steps = stepsPerMM(nvConfig,1)
    expect(one_mm_in_steps).toBe(1000);
    var one_in_in_steps = stepsPerIn(nvConfig,1)
    expect(one_in_in_steps).toBe(1000 * 25.4);


    var distance = stepsToDistance(stateIn,nvConfig, one_in_in_steps)

    var t = distanceToSteps(stateIn,nvConfig, distance)

    expect(t).toBe(one_in_in_steps)

    var mmsteps = distanceToSteps(state,nvConfig, 1)

    expect(mmsteps).toBe(1000)
    
    var t2 = stepsToDistance(state,nvConfig,mmsteps);
    expect(t2).toBe(1);

    var t3 = mmOrImp(state)
    expect(t3).toBe("(mm)");

    var t4 = mmOrImp(stateIn);
    expect(t4).toBe("(in)");


}
)
