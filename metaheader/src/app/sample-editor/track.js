import React, { useState, useEffect, useRef } from 'react'
import { SketchPicker } from 'react-color';
import { AiOutlineBgColors } from 'react-icons/ai'
import { MdEditNote } from 'react-icons/md'
import { BiUndo } from 'react-icons/bi'
import { useOnClickOutside } from '../helpers';
import TrackSampleSet from './track-sample-set';

const Track = (props) => {

    const samplesArray = [
        null,null,null,null,null
    ]
    const { index, track, color } = props;
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
                        trackIndex={index}
                        setShowEditMode={setShowEditMode}
                        updateTrack={props.updateTrack}
                    />
                    <TrackSampleSet 
                        index={index}
                        samples={samples}
                        setSamples={setSamples}
                        samplesArray={samplesArray}
                        getTrackSampleSet={getTrackSampleSet}
                    />
                </div>
        </React.Fragment>
    )
}

const TrackTitle = (props) => {

    const { showEditMode, setShowEditMode, title, updateTrack, trackIndex } = props;
    const [ previousTitle, setPreviousTitle ] = useState(title)

    useEffect(() => {
        // console.log('on show edit mode change - ' + showEditMode)
        if (showEditMode === true){
            setPreviousTitle(title)
            window.addEventListener('keypress',onKeyPress)
        } else if (showEditMode === false){
            window.removeEventListener('keypress',onKeyPress)
        }
    },[showEditMode])

    function onKeyPress(e){
        // console.log(e.keyCode)
        if (e.keyCode === 13){
            setPreviousTitle(title)
            setShowEditMode(false)
        } else if (e.keyCode === "Escape"){
            console.log('escape pressed')
            undoTitleChanges();
        }
    }

    function undoTitleChanges(){
        updateTrack(trackIndex,previousTitle)
        setShowEditMode(false)
    }

    const ref = useRef();
    useOnClickOutside(ref, e => {
        if (e.target.className !== "edit-button")  setShowEditMode(false)
    });

    const displayedTitle = title === null ? `Track ${trackIndex+1}` : title

    let titleDisplay;
    if (showEditMode === true){
        titleDisplay = (
            <div className='input-wrapper'>
                <input type="text" placeholder={""} value={title} onChange={e => updateTrack(trackIndex, e.target.value)}/>
                <a className='undo-title-change' onClick={undoTitleChanges}>
                    <BiUndo/>
                </a>
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

export default Track;