import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Track from './track';
import SketchFilePicker from './file-picker';


const SampleEditor = (props) => {

    const { colorsArray } = props;
    const [ sketchInfo, setSketchInfo ] = useState(null)
    const [ currentSketch, setCurrentSketch ] = useState(null)
    const [ tracks, setTracks ] = useState(null)
    const [ showFilePicker, setShowFilePicker ] = useState(false);

    console.log(sketchInfo);
    console.log(currentSketch);
    
    useEffect(() => {
        getSketchInfo()
    },[])

    useEffect(() => {
        if (sketchInfo !== null){
            // console.log(sketchInfo)
            getCurrentSelectedSketch()
        }
    },[sketchInfo])

    useEffect(() => {
        console.log(currentSketch,"currentSketch");
        if (currentSketch !== null){
            setTracks(currentSketch.tracks)
        }
    },[currentSketch])

    async function getSketchInfo(){
        const response = await fetch(`http://${window.location.hostname}:3000/sketchinfo/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();
        setSketchInfo(res)
    }

    async function getCurrentSelectedSketch(){
        const path = sketchInfo.lastSelectedSketch
        const response = await fetch(`http://${window.location.hostname}:3000/sketch/${path.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const res = await response.json();
        // console.log(res,"current sketch res");
        setCurrentSketch(res)        
    }

    async function saveCurrentSketch(fn){
        
        let savedSketch = currentSketch;
        if (fn && typeof(fn) === "string") savedSketch.name = fn;

        let json = JSON.stringify(currentSketch);
        let path = sketchInfo.lastSelectedSketch.split("zynthian/")[1];
        let fileName = sketchInfo.lastSelectedSketch.split('/')[sketchInfo.lastSelectedSketch.split('/').length - 1];

        const blob = new Blob([json], {type:"application/json"});
        const formData = new FormData();
        const sketchFolderPath = path.split(fileName)[0];
        
        if (fn && typeof(fn) === "string") fileName = fn;
        
        formData.append('file', blob,fileName); // appending file
        axios.post(`http://${window.location.hostname}:3000/upload/${sketchFolderPath.split('/').join('+++')}`, formData ).then(res => { // then print response status

            if (fn && typeof(fn) === "string"){
                updateSketchInfo(fn)
                setCurrentSketch(savedSketch)
            }
        });
    }

    async function updateSketchInfo(fn) {

        setShowFilePicker(false)

        // console.log("update sketch info")

        const originalFileName = sketchInfo.lastSelectedSketch.split('/')[sketchInfo.lastSelectedSketch.split('/').length - 1];
        const sketchFolderPath = sketchInfo.lastSelectedSketch.split(originalFileName)[0];
        const newSketchInfo = {
            ...sketchInfo,
            lastSelectedSketch:sketchFolderPath + fn
        }

        // console.log(newSketchInfo,"newSketchInfo")

        const blob = new Blob([JSON.stringify(newSketchInfo)], {type:"application/json"});
        const formData = new FormData();
        formData.append('file', blob,'.cache.json'); // appending file
        axios.post(`http://${window.location.hostname}:3000/upload/zynthian-my-data+++sessions+++`, formData ).then(res => { // then print response status
            setSketchInfo(newSketchInfo)
        });
    }

    function saveCurrentSketchAs(){
        const result = window.prompt("Enter FileName");
        saveCurrentSketch(result + ".sketch.json")
    }

    function updateTrack(index,title,color){

        const newTrack = {
            ...currentSketch.tracks[index],
            name:title,
            color
        }

        let newTracks = []
        currentSketch.tracks.forEach(function(t,i){
            if(i === index) newTracks.push(newTrack)
            else newTracks.push(t);
        })

        const newCurrentSketch = {
            ...currentSketch,
            tracks:newTracks
        }

        setCurrentSketch(newCurrentSketch);
    }

    let tracksDisplay;
    if (tracks !== null){
        
        const defaultColor = "#000000" 
        
        tracksDisplay = tracks.map((track,index) => {
            if (index < 10){
                return (
                    <Track 
                        key={index} 
                        index={index} 
                        color={track.color && track.color !== defaultColor ? track.color : colorsArray[index]}
                        updateTrack={updateTrack}
                        track={track}
                    />
                )
            }
        })
    }

    let filePickerDisplay;
    if (showFilePicker === true){
        filePickerDisplay = (
            <SketchFilePicker 
                onSelect={updateSketchInfo}
                setShowFilePicker={setShowFilePicker}
            />
        )
    }

    return (
        <React.Fragment>
            <div className='sample-editor-menu'> 
                <ul>
                    <li><a>New</a></li>
                    <li><a onClick={() => setShowFilePicker(showFilePicker === true ? false : true)}>Load</a></li>
                    <li><a onClick={saveCurrentSketch}>Save</a></li>
                    <li><a onClick={saveCurrentSketchAs}>Save As...</a></li>
                    {sketchInfo !== null ? <li style={{float:"right"}}><a>{sketchInfo.lastSelectedSketch}</a></li>: ''}
                </ul>
            </div>
            <div id="sample-editor">
                {tracksDisplay}
            </div>
            {filePickerDisplay}
        </React.Fragment>
    )
}

export default SampleEditor