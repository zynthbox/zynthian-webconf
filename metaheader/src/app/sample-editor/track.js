import React, { useState, useEffect, useRef } from 'react'
import Dropzone from 'react-dropzone'
import { SketchPicker } from 'react-color';
import axios from 'axios';
import { AiOutlineBgColors } from 'react-icons/ai'
import { MdEditNote } from 'react-icons/md'
import { BiUndo } from 'react-icons/bi'

import Sample from './sample';

const Track = (props) => {

    const samplesArray = [
        null,null,null,null,null
    ]

    const { index, track } = props;

    const [ title, setTitle ] = useState(track && track.name !== null ? track.name : `Track ${index + 1}`);
    const [ color, setColor ] = useState(props.color)
    const [ samples, setSamples ] = useState(samplesArray)
    const [ showEditMode, setShowEditMode ] = useState(false);
    const [ showColorPicker, setShowColorPicker ] = useState(false);
    const [ dragZoneContainerCssClass, setDragZoneContainerCssClass ] = useState('hidden')
    
    const [ showSampleSetDropZone, setShowSampleSetDropZone ] = useState(false);

    const ref = useRef();
    useOnClickOutside(ref, () => setShowColorPicker(false));

    useEffect(() => {
        getTrackSampleSet()
    },[])

    // useEffect(() => {
    //     if (title !==  `Track ${index + 1}`){
    //         if (!track || track && track.name !== title) props.updateTrack(index,title,color)
    //     }
    // },[title])

    // useEffect(() => {
    //     if (color !== props.color){
    //         if (!track || track && track.color !== color) props.updateTrack(index,title,color)
    //     }
    // },[color])

    useEffect(() => {
        if (props.track && props.track !== null){
            
            // setColor(track.color)
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
            // console.log(res,"res")
            setSamples(res);
        }
    }

    function addSample(file){
        let sampleIndexToReplace = samples.findIndex((sample) => sample === null);
        if (!sampleIndexToReplace || sampleIndexToReplace === null) sampleIndexToReplace = 0;
        const newSamples = [ ...samples.slice(0,sampleIndexToReplace), file, ...samples.slice(sampleIndexToReplace + 1, samples.length)]
        setSamples(newSamples)
    }

    async function onUploadSample(sample,sIndex){
        const sPath = sample.name;
        const response = await fetch(`http://${window.location.hostname}:3000/track/${(index+1)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({sIndex,sPath})
        });
        const res = await response.json()
        uploadSample(sample)
    }

    const uploadSample = async (sample) => {
        const formData = new FormData();
        formData.append('file', sample); // appending file
        const selectedFolder = `/zynthian-my-data/sketches/my-sketches/temp/wav/sampleset/bank.${index+1}/`
        // console.log(selectedFolder,"selected folder")
        axios.post(`http://${window.location.hostname}:3000/upload/${selectedFolder.split('/').join('+++')}`, formData ).then(res => { // then print response status
        //   console.log(res)
        });
    };

    async function removeSample(sample,sIndex,fetchSamples){

        const trackIndex = index + 1;
        const sPath = sample.path;
        
        const response = await fetch(`http://${window.location.hostname}:3000/sample/${(trackIndex)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({trackIndex,sPath,sIndex})
        });
        const res = await response.json()
        // console.log(res)
        setSamples(res);
    }

    function removeAllSamples(){
        samples.forEach(function(sample,index){
            let fetchSamples = false;
            if (index === sample.length - 1) fetchSamples = true;
            removeSample(sample,index,fetchSamples)
        });
    }

    const handleColorPickerChange = (color) => {
        props.updateTrack(index, track.name, color.hex)
    }

    let hideMaskTimeout;

    function onSampleListDragOver(){
        clearTimeout(hideMaskTimeout)
        setDragZoneContainerCssClass('')
    }

    function onSampleListDragExit(){
        hideMaskTimeout = setTimeout(() => {
            setDragZoneContainerCssClass('hidden')            
        }, 10);
    }

    function onDropSamples(acceptedFiles){
        setDragZoneContainerCssClass('hidden')
        acceptedFiles.forEach(function(file,index){
            addSample(file);
            // const reader = new FileReader();
        })
    }

    function onDropSampleSet(acceptedFiles){
        const newSamples = [];
        for (var i in acceptedFiles){
            let file = {
                path:acceptedFiles[i].path,
                file:acceptedFiles[i]
            }
            newSamples.push(file)
        }
        setSamples(acceptedFiles)
        setShowSampleSetDropZone(false)
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

    const samplesDisplay = samplesArray.map((sample,i) => (
        <Sample 
            key={i} 
            index={i} 
            sample={samples[i]} 
            trackIndex={index} 
            removeSample={removeSample}
            addSample={addSample}
            uploadSample={onUploadSample}
        />
    ))

    let sampleSetUploadDisplay;
    if (showSampleSetDropZone === true){
        sampleSetUploadDisplay = (
            <div className="sample-set-upload-container">
                <div className={"dropzone-container"}>
                    <Dropzone onDrop={acceptedFiles => onDropSampleSet(acceptedFiles)}>
                        {({getRootProps, getInputProps}) => (
                            <section>
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Drag 'n' drop some files here</p>
                            </div>
                            </section>
                        )}
                    </Dropzone>    
                </div>
            </div>
        )
    }

    return (
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
            <div className={"sample-list-container"}  onDragOver={onSampleListDragOver} onDragLeave={onSampleListDragExit}>
                <div className={"dropzone-container " + dragZoneContainerCssClass}>
                    <Dropzone onDrop={acceptedFiles => onDropSamples(acceptedFiles)}>
                        {({getRootProps, getInputProps}) => (
                            <section>
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <p>Drag 'n' drop some files here</p>
                            </div>
                            </section>
                        )}
                    </Dropzone>    
                </div>
                <ul className="sample-list">
                    {samplesDisplay}
                </ul>
            </div>
            <ul className="sample-set-actions">
                <li><a onClick={() => removeAllSamples()}><i style={{marginTop:"1px"}} className="glyphicon glyphicon-trash"></i></a></li>
                <li style={{float:"right"}}><a onClick={() => setShowSampleSetDropZone(showSampleSetDropZone === true ? false : true)}><i className="glyphicon glyphicon-plus"></i></a></li>
            </ul>
            {sampleSetUploadDisplay}
        </div>
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
        }
    }

    function undoTitleChanges(){
        setTitle(previousTitle)
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
                <input type="text" placeholder={displayedTitle} value={title} onChange={e => updateTrack(trackIndex, e.target.value)}/>
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

function useOnClickOutside(ref, handler) {
    useEffect(
      () => {
        const listener = (event) => {
          // Do nothing if clicking ref's element or descendent elements
          if (!ref.current || ref.current.contains(event.target)) {
            return;
          }
          handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
          document.removeEventListener("mousedown", listener);
          document.removeEventListener("touchstart", listener);
        };
      },
      // Add ref and handler to effect dependencies
      // It's worth noting that because passed in handler is a new ...
      // ... function on every render that will cause this effect ...
      // ... callback/cleanup to run every render. It's not a big deal ...
      // ... but to optimize you can wrap handler in useCallback before ...
      // ... passing it into this hook.
      [ref, handler]
    );
}

export default Track;