import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { getCurrentSketchpadFolder } from "./helpers";
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
   
   
    const [ isPlaying, setIsPlaying ] = useState(false);
    const { sketchpadInfo,sketchpad } = useSelector((state) => state.sampleEditor);    
    const [ url, setUrl ] = useState(null);
    

    
    useEffect(() => {               
        if (sample && sample.path){                
            let url=null;               
            const folder = getCurrentSketchpadFolder(sketchpadInfo.lastSelectedSketchpad,sketchpad.name)               
            let dir = folder.substring(folder.indexOf('zynthian-my-data'));            
            // handle specialcase remove 'Autosave.sketchpad.json' which sketchpad.name different with name from lastSelectedSketchpad
            dir = dir.split('/Autosave.sketchpad.json')[0]
            if(sampleSetMode=='sample-trig'){
                url = `http://${window.location.hostname}:3000/${dir}/wav/sampleset/sample-bank.${channelIndex +1}/${sample.path}`
                //url = `http://${window.location.hostname}:3000/${folder.split('/zynthian/')[1]}/wav/sampleset/sample-bank.${channelIndex +1}/${sample.path}`
            }else if(sampleSetMode=='synth' || sampleSetMode=='sample-loop'){
                url = `http://${window.location.hostname}:3000/${dir}/wav/${sample.path}`;
                //url = `http://${window.location.hostname}:3000/${folder.split('/zynthian/')[1]}/wav/${sample.path}`;
            }
           setUrl(url);         
        }else{
            setUrl(url);         
        }
    },[sample])

    function isShowClips(){
        return (sampleSetMode=='external')?false:true        
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

    if (sample && sample.path){
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
        if (samplePath && samplePath !== null && samplePath!=''){
            if (samplePath.indexOf('/') > -1) samplePath = samplePath.split('/')[samplePath.split('/').length - 1];
            if (samplePath.split('.')[0].length > 16) samplePath = samplePath.substring(0,17) + '...wav';
        }else{
            samplePath = "---";
        }
    }

    let samplePathDisplay = "---";
    if (sample && sample.path) samplePathDisplay = samplePath;

    let audioPlayerDisplay;
    if (sample && sample.path){          
        audioPlayerDisplay = (
            <audio
                id={`sample-${channelIndex + 1}-${index + 1}-audio-player`}
                src={url}
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