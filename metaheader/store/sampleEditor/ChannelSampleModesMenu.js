import React from 'react'
import { useDispatch } from "react-redux";
import { updateChannelSampleModes } from './sampleEditorSlice';

const ChannelSampleModesMenus = ({ index,keyZoneMode, channelAudioType } ) => {

    const dispatch = useDispatch()

    function onTrackAudioTypeClick(val){
        dispatch(updateChannelSampleModes({index,keyZoneMode,channelAudioType:val}))        
    }

    function onKeyZoneModeOptionClick(val){
        dispatch(updateChannelSampleModes({index,keyzone_mode:val,channelAudioType}))
    }

    return (
        <div className='track-keyzone-mode-menu'>
            <div className='track-audio-type-menu-container'>
                {/* trig - sample-trig | slice - smaple-slice | loop - sample-loop */}
                <ul>
                    <li><a onClick={() => onTrackAudioTypeClick("synth")} className={channelAudioType === "synth" ? "is-active" : ""}>Synth</a></li>
                    <li><a onClick={() => onTrackAudioTypeClick("sample-trig")} className={channelAudioType === "sample-trig" ? "is-active" : ""}>Sample</a></li>
                    <li><a onClick={() => onTrackAudioTypeClick("sample-loop")} className={channelAudioType === "sample-loop" ? "is-active" : ""}>Sketch</a></li>
                    <li><a onClick={() => onTrackAudioTypeClick("external")} className={channelAudioType === "external" ? "is-active" : ""}>External</a></li>
                    {/* <li><a onClick={() => onTrackAudioTypeClick("sample-loop")} className={trackAudioType === "sample-loop" ? "is-active" : ""}>Loop</a></li> */}
                </ul>
            </div>
            <div style={{opacity: (channelAudioType == "sample-trig" ? "1" : "0")}} className='keyzone-mode-menu-container'>
                {/* off - all-full | auto  - split-full | narrow - split-narrow */}
                <span>Auto Split:</span>
                <ul>
                    <li><a onClick={() => onKeyZoneModeOptionClick("all-full")} className={keyZoneMode === "all-full" ? "is-active" : ""}>Off</a></li>
                    <li><a onClick={() => onKeyZoneModeOptionClick("split-full")}  className={keyZoneMode === "split-full" ? "is-active" : ""}>Auto</a></li>
                    <li><a onClick={() => onKeyZoneModeOptionClick("split-narrow")}  className={keyZoneMode === "split-narrow" ? "is-active" : ""}>Narrow</a></li>
                </ul>
            </div>
        </div>
    )
}

export default ChannelSampleModesMenus;