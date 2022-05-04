import React, { useState, useEffect, useRef } from 'react'
import { SketchPicker } from 'react-color';
import { AiOutlineBgColors } from 'react-icons/ai'
import { MdEditNote } from 'react-icons/md'
import { BiUndo, BiGridVertical } from 'react-icons/bi'
import { useOnClickOutside } from '../helpers';
import TrackSampleSet from './track-sample-set';

const Track = (props) => {

    const samplesArray = [
        null,null,null,null,null
    ]
    const { index, track, color, updateTrackClips } = props;
    const [ samples, setSamples ] = useState(samplesArray);
    const [ showEditMode, setShowEditMode ] = useState(false);
    const [ showColorPicker, setShowColorPicker ] = useState(false);


    const ref = useRef();
    useOnClickOutside(ref, () => setShowColorPicker(false));

    useEffect(() => {
        getTrackSampleSet()
    },[])

    useEffect(() => {
        if (props.track && props.track !== null){
            getTrackSampleSet()
        }
    },[props.track])

    async function getTrackSampleSet(){
        
        const response = await fetch(`http://${window.location.hostname}:3000/track/${index+1}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();
        if (res){
            setSamples(res);
        }
    }

    const handleColorPickerChange = (color) => {
        props.updateTrack(index, track.name, color.hex)
    }

    let colorPickerDisplay;
    if (showColorPicker === true){
        colorPickerDisplay = (
            <div className="color-picker-container">
                <SketchPicker 
                    color={color}
                    onChange={ handleColorPickerChange }
                />
            </div>
        )
    }

    // <li>
    //     <a className="track-pattern-editor" onClick={() => props.onShowPatternEditor(index)}>
    //         <BiGridVertical/>
    //     </a>
    // </li>

    return (
        <React.Fragment>
                <div className="sample-set" style={{backgroundColor:props.color}}>
                    <div ref={ref} className="edit-menu-container">
                        <ul className="edit-menu">
                            <li>
                                <a className="edit-button" onClick={() => setShowEditMode(showEditMode == true ? false : true)}>
                                    <MdEditNote />
                                    <span className="edit-button" ></span>
                                </a>
                            </li>
                            <li>
                                <a className="color-picker" onClick={() => setShowColorPicker(showColorPicker == true ? false : true)}>
                                    <AiOutlineBgColors/>
                                </a>
                            </li>
                        </ul>
                        {colorPickerDisplay}
                    </div>
                    <TrackTitle 
                        showEditMode={showEditMode}
                        title={track.name}
                        index={index}
                        setShowEditMode={setShowEditMode}
                        updateTrack={props.updateTrack}
                    />
                    <TrackSampleModesMenus 
                        index={index}
                        title={track.name}
                        color={color}
                        keyZoneMode={track.keyzone_mode}
                        trackAudioType={track.trackAudioType}
                        updateTrack={props.updateTrack}
                    />
                    <TrackSampleSet 
                        index={index}
                        samples={track.trackAudioType === "sample-loop" ? track.clips : samples}
                        setSamples={setSamples}
                        samplesArray={samplesArray}
                        getTrackSampleSet={getTrackSampleSet}
                        sampleSetMode={track.trackAudioType}
                        keyZoneMode={track.keyzone_mode}
                        updateTrackClips={updateTrackClips}
                    />
                </div>
        </React.Fragment>
    )
}

const TrackTitle = (props) => {

    const { showEditMode, setShowEditMode, title, updateTrack, index } = props;

    const [ previousTitle, setPreviousTitle ] = useState(title)

    const undoChangesRef = useRef(null)
    const saveChangesRef = useRef(null)

    useEffect(() => {
        window.removeEventListener('keydown',handleKeyPress,false)
        window.addEventListener('keydown',handleKeyPress,false);
        return () => {
            window.removeEventListener('keydown',handleKeyPress,false)
        }
    },[title])

    function handleKeyPress(e){
        // console.log(e.key);
        if (e.key === "Escape"){
            undoChangesRef.current.click()
        } else if (e.key === "Enter"){
            saveChangesRef.current.click()
        }
    }

    useEffect(() => {
        // console.log('on show edit mode change - ' + showEditMode)
        if (showEditMode === true){
            setPreviousTitle(title)
            // window.addEventListener('keypress',onKeyPress)
        } else if (showEditMode === false){
            // window.removeEventListener('keypress',onKeyPress)
        }
    },[showEditMode])

    function undoTitleChanges(){
        updateTrack(index,previousTitle)
        setShowEditMode(false)
    }

    function saveTitleChanges(){
        setPreviousTitle(title)
        setShowEditMode(false)   
    }

    const ref = useRef();
    useOnClickOutside(ref, e => {
        if (e.target.className !== "edit-button")  setShowEditMode(false)
    });

    const displayedTitle = title === null ? `Track ${index+1}` : title

    let titleDisplay;
    if (showEditMode === true){
        titleDisplay = (
            <div className='input-wrapper'>
                <input type="text" placeholder={""} value={title} onChange={e => updateTrack(index, e.target.value)} autoFocus />
                <a ref={undoChangesRef} className='undo-title-change' onClick={undoTitleChanges}>
                    <BiUndo/>
                </a>
                <a ref={saveChangesRef} className='save-changes' onClick={() => saveTitleChanges()}></a>
            </div>
        )
    } else {
        titleDisplay = <h2>{displayedTitle}</h2>;
    }

    return (
            <div className="sample-set-title">
                <div ref={ref} className='title-wrapper'>
                    {titleDisplay}
                </div>
            </div>
    )
}

const TrackSampleModesMenus = (props) => {

    const { index, title, color, keyZoneMode, trackAudioType, updateTrack } = props

    function onKeyZoneModeOptionClick(kzm){
        updateTrack(index,title,color,kzm)
    }

    function onTrackAudioTypeClick(tat){
        updateTrack(index,title,color,keyZoneMode,tat)
    }

    return (
        <div className='track-keyzone-mode-menu'>
            <div className='track-audio-type-menu-container'>
                {/* trig - sample-trig | slice - smaple-slice | loop - sample-loop */}
                <ul>
                    <li><a onClick={() => onTrackAudioTypeClick("sample-trig")} className={trackAudioType === "sample-trig" ? "is-active" : ""}>Trig</a></li>
                    <li><a onClick={() => onTrackAudioTypeClick("sample-slice")} className={trackAudioType === "sample-slice" ? "is-active" : ""}>Slice</a></li>
                    {/* <li><a onClick={() => onTrackAudioTypeClick("sample-loop")} className={trackAudioType === "sample-loop" ? "is-active" : ""}>Loop</a></li> */}
                </ul>
            </div>
            <div style={{opacity: (trackAudioType == "sample-trig" ? "1" : "0")}} className='keyzone-mode-menu-container'>
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

export default Track;