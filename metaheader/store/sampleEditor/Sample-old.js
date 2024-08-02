import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";

const Sample = (props) => {
   
    const { 
        index, 
        sample, 
        channelIndex,
        sampleSetMode,
        onRemoveSample,
        onAddSample,
        uploadSample, 
        setLoadFromSketchPadSampleIndex, 
        setLoadFromSketchPadFileType, 
        setShowSampleSetSourcePicker 
    } = props
   
    const [ data, setData ] = useState(null);
    const [ isPlaying, setIsPlaying ] = useState(false);
    const { sketchpad } = useSelector((state) => state.sampleEditor);

   
    useEffect(() => {
        if (sample){
            if (sample.path) getSampleFile()
        }
    },[sample])

    async function getSampleFile(){
        let sPath = sample.path.split('.').join('++');
        if (sPath.indexOf('/') > -1) sPath = sPath.split('/').join('+');
        const response = await fetch(`http://${window.location.hostname}:3000/${sampleSetMode === "sample-loop" ? "clip" : "sample"}/${(channelIndex+1) + "+++" + sPath}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.blob();
        readSampleData(res);
    }

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

    function playSample(){
        setIsPlaying(true);
        document.getElementById(`sample-${channelIndex + 1}-${index + 1}-audio-player`).play();
    }

    function pauseSample(){
        setIsPlaying(false);
        document.getElementById(`sample-${channelIndex + 1}-${index + 1}-audio-player`).pause();
    }

    function onPlayerTimeUpdate(e){
        const playerElement = e.target;
        if (playerElement.currentTime >= playerElement.duration) pauseSample();
    }

    let sampleControlDisplay, sampleActionsDisplay;

    if (sample && sample !== null && sample.path !== null){
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
            <a className="edit-sample-button" onClick={() => onRemoveSample(index)}>
                <i className="glyphicon glyphicon-trash"></i> 
            </a>
        )
    
    } else {
        sampleActionsDisplay = (
            <a className="edit-sample-button" onClick={() => onAddSample(index)}>
                <i className="glyphicon glyphicon-plus"></i> 
            </a>            
        )
    }

    let samplePath;
    if (sample){        
        samplePath = sample.path ? sample.path : sample.name;
        if (samplePath && samplePath !== null){
            if (samplePath.indexOf('/') > -1) samplePath = samplePath.split('/')[samplePath.split('/').length - 1];
            if (samplePath.split('.')[0].length > 16) samplePath = samplePath.substring(0,17) + '...wav';
        }
    }

    let samplePathDisplay = "---";
    if (samplePath && samplePath !== null) samplePathDisplay = samplePath;

    let audioPlayerDisplay;
    if (data !== null){
        audioPlayerDisplay = (
            <audio
                id={`sample-${channelIndex + 1}-${index + 1}-audio-player`}
                src={data}
                onTimeUpdate={(e) => onPlayerTimeUpdate(e)}  
                onLoadedMetadata={(e) => onPlayerTimeUpdate(e)}>
            </audio>
        )
    }

    return (
        <li id={`sample-${channelIndex + 1}-${index + 1}`}>
            {audioPlayerDisplay}
            {sampleControlDisplay}
            <h4 title={sample && samplePath !== null ? sample.path : ''}>{samplePathDisplay}</h4>
            {sampleActionsDisplay}
        </li>
    )
}

export default Sample