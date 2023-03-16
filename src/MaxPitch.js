import { send,mmToIn,inToMM,stepsToDistance,stepsPerMM ,maxPitch} from './util.js';

export default function MaxPitch({state,nvConfig}){


    

    return (
        <div>

        Max Pitch: {maxPitch(state,nvConfig)} 

            </div>
    )
}
