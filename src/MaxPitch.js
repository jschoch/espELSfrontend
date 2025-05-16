import { send,mmToIn,inToMM,stepsToDistance,stepsPerMM ,maxPitch} from './util.js';
import { t, setLang } from './translation.js';
export default function MaxPitch({state,nvConfig}){


    

    return (
        <div>

        {t("Max Pitch:")} {maxPitch(state,nvConfig)} 

            </div>
    )
}
