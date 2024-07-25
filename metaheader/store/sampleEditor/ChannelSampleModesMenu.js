import React from 'react'
import { useDispatch } from "react-redux";
import { updateChannelSampleModes } from './sampleEditorSlice';

const ChannelSampleModesMenus = ({ index,keyzone_mode, trackType } ) => {

    const dispatch = useDispatch()

    function onTrackAudioTypeClick(val){        
        dispatch(updateChannelSampleModes({index,keyzone_mode,trackType:val}))        
    }

    function onKeyZoneModeOptionClick(val){
        dispatch(updateChannelSampleModes({index,keyzone_mode:val,trackType}))
    }

    return (
        <div className='track-keyzone-mode-menu'> 
            <div className='track-audio-type-menu-container'>
                {/* trig - sample-trig | slice - smaple-slice | loop - sample-loop */}
                <ul>
                    <li><a onClick={() => onTrackAudioTypeClick("synth")} className={trackType === "synth" ? "is-active" : ""}>Synth</a></li>
                    <li><a onClick={() => onTrackAudioTypeClick("sample-trig")} className={trackType === "sample-trig" ? "is-active" : ""}>Sample</a></li>
                    <li><a onClick={() => onTrackAudioTypeClick("sample-loop")} className={trackType === "sample-loop" ? "is-active" : ""}>Sketch</a></li>
                    <li><a onClick={() => onTrackAudioTypeClick("external")} className={trackType === "external" ? "is-active" : ""}>External</a></li>
                    {/* <li><a onClick={() => onTrackAudioTypeClick("sample-loop")} className={trackAudioType === "sample-loop" ? "is-active" : ""}>Loop</a></li> */}
                </ul>
            </div>
            <div style={{opacity: (trackType == "sample-trig" ? "1" : "0")}} className='keyzone-mode-menu-container'>
                {/* off - all-full | auto  - split-full | narrow - split-narrow */}
                <span>Auto Split:</span>
                <ul>
                    <li><a onClick={() => onKeyZoneModeOptionClick("all-full")} className={keyzone_mode === "all-full" ? "is-active" : ""}>Off</a></li>
                    <li><a onClick={() => onKeyZoneModeOptionClick("split-full")}  className={keyzone_mode === "split-full" ? "is-active" : ""}>Auto</a></li>
                    <li><a onClick={() => onKeyZoneModeOptionClick("split-narrow")}  className={keyzone_mode === "split-narrow" ? "is-active" : ""}>Narrow</a></li>
                </ul>
            </div>
        </div>
    )
}

export default ChannelSampleModesMenus;