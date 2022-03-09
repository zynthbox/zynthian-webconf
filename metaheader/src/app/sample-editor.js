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
        <Track index={index} color={c}/>
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

    const [ samples, setSamples ] = useState(samplesArray)
    console.log(samples,"samples")
    const [ showEditMode, setShowEditMode ] = useState(false);
    const [ showColorPicker, setShowColorPicker ] = useState(false);
    const [ dragZoneContainerCssClass, setDragZoneContainerCssClass ] = useState('hidden')
    const [ title, setTitle ] = useState(`Track ${index + 1}`);
    const [ color, setColor ] = useState(props.color)

    const ref = useRef();
    useOnClickOutside(ref, () => setShowColorPicker(false));

    const handleColorPickerChange = (color) => {
        setColor(color.hex)
    }

    function onSampleListDragOver(){
        setDragZoneContainerCssClass('')
    }

    function onSampleListDragExit(){
        setDragZoneContainerCssClass('hidden')
    }

    function onDropSamples(acceptedFiles){
        setDragZoneContainerCssClass('hidden')
        acceptedFiles.forEach(function(file,index){
            addSampleToSampleSet(file);
            // const reader = new FileReader();
            // reader.addEventListener("load", function () {
            //     file.data = reader.result;
            // }, false);
            
            // if (file) {
            //     reader.readAsDataURL(file);
            // }
        })

    }

    function addSampleToSampleSet(file){
        let sampleIndexToReplace = samples.findIndex((sample) => sample === null);
        if (!sampleIndexToReplace || sampleIndexToReplace === null) sampleIndexToReplace = 0;
        const newSamples = [ ...samples.slice(0,sampleIndexToReplace), file, ...samples.slice(sampleIndexToReplace + 1, samples.length)]
        setSamples(newSamples)
    }

    function onClearAllClick(){
        console.log('on clear all click')
    }

    function onUploadSampleSetClick(){
        console.log('on upload sample set click')
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

    const samplesDisplay = samples.map((sample,i) => (
        <Sample 
            key={i} 
            index={i} 
            sample={samples[i]} 
            trackIndex={index} 
        />
    ))

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
            <div className={"sample-list-container"} onDragOver={onSampleListDragOver} onDragLeave={onSampleListDragExit}>
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
                <li><a onClick={() => onClearAllClick()}><i className="glyphicon glyphicon-trash"></i> Clear All</a></li>
                <li><a onClick={() => onUploadSampleSetClick()}><i className="glyphicon glyphicon-plus"></i> Upload Sample set</a></li>
            </ul>
        </div>
    )
}

const Sample = (props) => {

    const { index, sample, trackIndex } = props

    console.log(sample)

    function onRemoveSampleClick(){
        console.log('remove sample')
    }

    function onAddSampleClick(){
        console.log('add sample')
    }

    let sampleActionsDisplay;
    if (sample){
        sampleActionsDisplay = (
            <a className="edit-sample-button" onClick={() => onRemoveSampleClick()}>
                <i className="glyphicon glyphicon-trash"></i> 
                Remove
            </a>
                
        )
    } else {
        sampleActionsDisplay = (
            <a className="edit-sample-button" onClick={() => onAddSampleClick()}>
                <i className="glyphicon glyphicon-plus"></i> 
                Add
            </a>            
        )
    }

    return (
        <li id={`sample-${trackIndex + 1}-${index + 1}`}>
            <i className='glyphicon glyphicon-play-circle'></i>
            <h4>{sample ? sample.name : '---'}</h4>
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