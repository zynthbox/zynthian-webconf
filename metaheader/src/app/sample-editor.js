import React, { useState, useEffect, useRef } from 'react'
import Dropzone from 'react-dropzone'
import { SketchPicker } from 'react-color';

const SampleEditor = () => {

    const tracksArray = [
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {}
    ]

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

    const [ tracks, setTracks ] = useState(tracksArray)

    const sampleSetsDisplay = colorsArray.map((c,index) => (
        <Track 
            key={index} 
            index={index} 
            color={c}
        />
    ))

    return (
        <div id="sample-editor">
            {sampleSetsDisplay}
        </div>
    )
}

const Track = (props) => {

    const samplesArray = [
        null,null,null,null,null
    ]

    const { index } = props;

    const [ title, setTitle ] = useState(`Track ${index + 1}`);
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

    async function getTrackSampleSet(){
        const response = await fetch(`http://${window.location.hostname}:3000/tracks/${index+1}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();
        setSamples(res);
    }

    function addSample(file){
        let sampleIndexToReplace = samples.findIndex((sample) => sample === null);
        if (!sampleIndexToReplace || sampleIndexToReplace === null) sampleIndexToReplace = 0;
        const newSamples = [ ...samples.slice(0,sampleIndexToReplace), file, ...samples.slice(sampleIndexToReplace + 1, samples.length)]
        setSamples(newSamples)
    }

    function removeSample(index){
        const newSamples = [ ...samples.slice(0,index), null, ...samples.slice(index + 1, samples.length)]
        setSamples(newSamples)
    }

    function removeAllSamples(){
        setSamples(samplesArray)
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

    let titleDisplay;
    if (showEditMode === true){
        titleDisplay = (
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
        )
    } else {
        titleDisplay = <h2>{title}</h2>;
    }

    let colorPickerDisplay;
    if (showColorPicker === true){
        colorPickerDisplay = (
            <div ref={ref} className="color-picker-container">
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
        />
    ))

    let sampleSetUploadDisplay;
    if (showSampleSetDropZone === true){
        sampleSetUploadDisplay = (
            <div className="sample-set-upload-container">
                <div className={"dropzone-container " + dragZoneContainerCssClass}>
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
            {colorPickerDisplay}
            <div className="sample-set-title">
                {titleDisplay}
            </div>
            <ul className="edit-menu">
                <li>
                    <a className="edit-button" onClick={() => setShowEditMode(showEditMode == true ? false : true)}>
                        <i className="glyphicon glyphicon-pencil"></i>
                    </a>
                </li>
                <li>|</li>
                <li>
                    <a className="color-picker" onClick={() => setShowColorPicker(showColorPicker == true ? false : true)}>
                        Color
                    </a>
                </li>
            </ul>
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
                <li><a onClick={() => setShowSampleSetDropZone(showSampleSetDropZone === true ? false : true)}><i className="glyphicon glyphicon-plus"></i> Upload Sampleset</a></li>
            </ul>

            {sampleSetUploadDisplay}

        </div>
    )
}

const Sample = (props) => {

    const { index, sample, trackIndex, removeSample } = props

    const [ data, setData ] = useState(null);
    const [ isPlaying, setIsPlaying ] = useState(false);

    // if (data !== null) console.log(data,"data")

    useEffect(() => {
        readSampleData()
    },[sample])

    function readSampleData(){
        if (sample){
            console.log(sample,"sample")
            const reader = new FileReader();
            reader.addEventListener('load',function(){
                setData(reader.result)
            },false)
            reader.readAsDataURL(sample)
        }
    }

    function playSample(){
        setIsPlaying(true);
        document.getElementById(`sample-${trackIndex + 1}-${index + 1}-audio-player`).play();
    }

    function pauseSample(){
        setIsPlaying(false);
        document.getElementById(`sample-${trackIndex + 1}-${index + 1}-audio-player`).pause();

    }

    function onAddSampleClick(){
        console.log('add sample')
    }
    
    let sampleControlDisplay, sampleActionsDisplay;
    if (sample){
        if (isPlaying === true){
            sampleControlDisplay = (
                <a className='play-sample-button' onClick={pauseSample}>
                    <i className='glyphicon glyphicon-pause-circle'></i>
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
            <a className="edit-sample-button" onClick={() => removeSample(index)}>
                <i className="glyphicon glyphicon-trash"></i> 
            </a>
        )
    
    } else {
        sampleActionsDisplay = (
            <a className="edit-sample-button" onClick={() => onAddSampleClick()}>
                <i className="glyphicon glyphicon-plus"></i> 
            </a>            
        )
    }

    let samplePath;
    if (sample){
        samplePath = sample.path
        if (sample.path.split('.')[0].length > 16){
            samplePath = sample.path.substring(0,17) + '...wav'
        }
    }

    return (
        <li id={`sample-${trackIndex + 1}-${index + 1}`}>

            <audio
                id={`sample-${trackIndex + 1}-${index + 1}-audio-player`}
                controls
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