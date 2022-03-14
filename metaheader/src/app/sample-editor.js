import React, { useState, useEffect, useRef } from 'react'
import Dropzone from 'react-dropzone'
import { SketchPicker } from 'react-color';
import axios from 'axios';
import { AiOutlineBgColors } from 'react-icons/ai'
import { ImTextColor } from 'react-icons/im'
import { MdEditNote } from 'react-icons/md'
import { BiUndo } from 'react-icons/bi'


const SampleEditor = () => {

    const [ sketchInfo, setSketchInfo ] = useState(null)
    const [ currentSketch, setCurrentSketch ] = useState(null)

    useEffect(() => {
        getSketchInfo()
    },[])

    useEffect(() => {
        getCurrentSelectedSketch()
    },[sketchInfo])

    async function getSketchInfo(){
        console.log('GET SKETCH INFO')
        const response = await fetch(`http://${window.location.hostname}:3000/sketchinfo/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();
        console.log(res);
        setSketchInfo(res)
    }

    async function getCurrentSelectedSketch(){
        console.log('GET CURRENT SELECTED SKETCH')
        const path = sketchInfo.lastSelectedSketch
        const response = await fetch(`http://${window.location.hostname}:3000/sketch/${path.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const res = await response.json();
        console.log(res);
        setCurrentSketch(res)        
    }

    const colorsArray = [
        "#B23730",
        "#EE514B",
        "#F77535",
        "#F7D635",
        "#FE68B1",
        "#A438FF",
        "#6491FF",
        "#73F6EE",
        "#65E679",
        "#9A7136",
    ]

    let tracksDisplay;
    if (currentSketch !== null){
        tracksDisplay = currentSketch.tracks.map((c,index) => (
            <Track 
                key={index} 
                index={index} 
                color={colorsArray[index]}
            />
        ))
    }

    return (
        <React.Fragment>
            <div className='sample-editor-menu'>
                <ul>
                    <li><a>New</a></li>
                    <li><a>Load</a></li>
                    <li><a>Save</a></li>
                    <li><a>Save As...</a></li>
                </ul>
            </div>
            <div id="sample-editor">
                {tracksDisplay}
            </div>
        </React.Fragment>
    )
}

const Track = (props) => {

    const samplesArray = [
        null,null,null,null,null
    ]

    const { index, track } = props;

    const [ title, setTitle ] = useState(track && track.name !== null ? track.name : `Track ${index + 1}`);
    const [ color, setColor ] = useState(props.color)
    const [ trackExists, setTrackExists ] = useState(false)
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
            setTrackExists(true)
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
        const selectedFolder = `/zynthian-my-data/sketches/my-sketches/temp/wav/samples/sampleset.${index+1}/`
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
        setColor(color.hex)
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
        <div className="sample-set" style={{backgroundColor:color}}>
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
                title={title}
                setTitle={setTitle}
                setShowEditMode={setShowEditMode}
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

    const { showEditMode, setShowEditMode, title, setTitle } = props;

    const [ previousTitle, setPreviousTitle ] = useState(title)

    useEffect(() => {
        console.log('on show edit mode change - ' + showEditMode)
        if (showEditMode === true){
            setPreviousTitle(title)
            window.addEventListener('keypress',onKeyPress)
        } else if (showEditMode === false){
            window.removeEventListener('keypress',onKeyPress)
        }
    },[showEditMode])

    function onKeyPress(e){
        console.log(e.keyCode)
        if (e.keyCode === 13){
            setPreviousTitle(title)
            setShowEditMode(false)
        }

        evt = evt || window.event;
        var isEscape = false;
        if ("key" in evt) {
            isEscape = (evt.key === "Escape" || evt.key === "Esc");
        } else {
            isEscape = (evt.keyCode === 27);
        }
        if (isEscape) {
            undoTitleChanges()
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

    let titleDisplay;
    if (showEditMode === true){
        titleDisplay = (
            <div className='input-wrapper'>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
                <a className='undo-title-change' onClick={undoTitleChanges}>
                    <BiUndo/>
                </a>
            </div>
        )
    } else {
        titleDisplay = <h2>{title}</h2>;
    }

    return (
        <div className="sample-set-title">
            <div ref={ref} className='title-wrapper'>
                {titleDisplay}
            </div>
        </div>
    )
}

const Sample = (props) => {

    const { index, sample, trackIndex, removeSample, addSample, uploadSample } = props

    const [ data, setData ] = useState(null);
    const [ isPlaying, setIsPlaying ] = useState(false);

    // if (data !== null) console.log(data,"data")
    
    useEffect(() => {
        if (sample){
            if (sample.name){
                readSampleData(sample)
                // console.log('will upload sample')
                uploadSample(sample,index)
            } else if (sample.path){
                getSampleFile()
            }
        }
    },[sample])

    function readSampleData(file){
        // console.log(sample,"sample")
        const reader = new FileReader();
        reader.addEventListener('load',function(){
            let result = reader.result;
            if (reader.result.indexOf('data:application/octet-stream;') > -1){
                result = reader.result.split(':application/octet-stream;').join(':audio/wav;')
            }
            setData(result)
        },false)
        reader.readAsDataURL(file)
    }

    async function getSampleFile(){
        const response = await fetch(`http://${window.location.hostname}:3000/sample/${(trackIndex+1) + "+++" + sample.path.split('.').join('++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.blob();
        readSampleData(res);
    }

    function playSample(){
        setIsPlaying(true);
        document.getElementById(`sample-${trackIndex + 1}-${index + 1}-audio-player`).play();
    }

    function pauseSample(){
        setIsPlaying(false);
        document.getElementById(`sample-${trackIndex + 1}-${index + 1}-audio-player`).pause();
    }
    
    let sampleControlDisplay, sampleActionsDisplay;
    if (sample){
        if (isPlaying === true){
            sampleControlDisplay = (
                <a className='play-sample-button' onClick={pauseSample}>
                    <i className='glyphicon glyphicon-pause'></i>
                </a>
            )
        } else {
            sampleControlDisplay = (
                <a className='play-sample-button' onClick={playSample}>
                    <i className='glyphicon glyphicon-play-circle'></i>
                </a>
            )
        }

        sampleActionsDisplay = (
            <a className="edit-sample-button" onClick={() => removeSample(sample,index,true)}>
                <i className="glyphicon glyphicon-trash"></i> 
            </a>
        )
    
    } else {
        sampleActionsDisplay = (
            <a className="edit-sample-button">
                <input type="file" 
                    onChange={(e) => addSample(e.target.files[0],index)}
                />
                <i className="glyphicon glyphicon-plus"></i> 
            </a>            
        )
    }

    let samplePath;
    if (sample){
        samplePath = sample.path ? sample.path : sample.name
        if (samplePath.split('.')[0].length > 16){
            samplePath = samplePath.substring(0,17) + '...wav'
        }
    }

    return (
        <li id={`sample-${trackIndex + 1}-${index + 1}`}>

            <audio
                id={`sample-${trackIndex + 1}-${index + 1}-audio-player`}
                src={data}>
            </audio>

            {sampleControlDisplay}
            <h4 title={sample ? sample.path : ''}>{sample ? samplePath : '---'}</h4>
            {sampleActionsDisplay}
        </li>
    )
}

// Hook
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

export default SampleEditor