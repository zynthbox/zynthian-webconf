import React, { useState, useEffect } from 'react'

const Sample = (props) => {

    const { index, sample, trackIndex, removeSample, uploadSample, setLoadFromSketchPadSampleIndex, setLoadFromSketchPadFileType } = props

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
        let sPath = sample.path.split('.').join('++');
        if (sPath.indexOf('/') > -1) sPath = sPath.split('/').join('+');
        const response = await fetch(`http://${window.location.hostname}:3000/${props.sampleSetMode === "sample-loop" ? "clip" : "sample"}/${(trackIndex+1) + "+++" + sPath}`, {
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
    
    function onSamplePlusClick(index){
        setLoadFromSketchPadFileType('wav')
        setLoadFromSketchPadSampleIndex(index)
    }

    let sampleControlDisplay, sampleActionsDisplay;

    console.log(sample)

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
            <a className="edit-sample-button" onClick={() => removeSample(sample,index,true)}>
                <i className="glyphicon glyphicon-trash"></i> 
            </a>
        )
    
    } else {
        sampleActionsDisplay = (
            <a className="edit-sample-button" onClick={() => onSamplePlusClick(index)}>
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

    return (
        <li id={`sample-${trackIndex + 1}-${index + 1}`}>

            <audio
                id={`sample-${trackIndex + 1}-${index + 1}-audio-player`}
                src={data}>
            </audio>

            {sampleControlDisplay}
            <h4 title={sample && samplePath !== null ? sample.path : ''}>{sample && samplePath !== null ? samplePath : '---'}</h4>
            {sampleActionsDisplay}
        </li>
    )
}

export default Sample