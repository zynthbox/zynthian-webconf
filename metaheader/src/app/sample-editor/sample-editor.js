import React, { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import Track from './track';
import SketchPadFileLoader from './sketch-pad-file-loader'
import LoadingSpinner from '../loading-spinner';
const PatternEditor = lazy(()=>import('./pattern-editor'))

const SampleEditor = (props) => {

    const { colorsArray } = props;
    const [ sketchInfo, setSketchInfo ] = useState(null)
    const [ currentSketch, setCurrentSketch ] = useState(null)
    const [ tracks, setTracks ] = useState(null)
    const [ showFilePicker, setShowFilePicker ] = useState(false);
    const [ showPatternEditor, setShowPatternEditor ] = useState(false);
    const [ patternEditorTrackIndex, setPatternEditorTrackIndex ] = useState(null);
    const [ sketchPadDialogActionType, setSketchPadDialogActionType ] = useState(null)

    // console.log("*** STATE UPDATE ****")
    // console.log(sketchInfo,"sketchInfo");
    // console.log(currentSketch,"current sketch");
    // console.log("*** /STATE UPDATE ****")
    
    useEffect(() => {
        getSketchInfo()
        setTimeout(() => {
            const sampleEditorContainer = document.getElementById('sample-editor').clientHeight;

        }, 100);
    },[])

    useEffect(() => {
        if (sketchInfo !== null){
            getCurrentSelectedSketch()
        }
    },[sketchInfo])

    useEffect(() => {
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
        let path = sketchInfo.lastSelectedSketch;
        if (path.indexOf('/zynthian/') > -1 ) path = path.split('/zynthian/')[1];
        let fileName = sketchInfo.lastSelectedSketch.split('/')[sketchInfo.lastSelectedSketch.split('/').length - 1];

        const blob = new Blob([json], {type:"application/json"});
        const formData = new FormData();
        const sketchFolderPath = path.split(fileName)[0];
        
        if (fn && typeof(fn) === "string") fileName = fn;
        
        // console.log(sketchFolderPath)

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

        // const originalFileName = sketchInfo.lastSelectedSketch.split('/')[sketchInfo.lastSelectedSketch.split('/').length - 1];
        // const sketchFolderPath = sketchInfo.lastSelectedSketch.split(originalFileName)[0];
        const newSketchInfo = {
            ...sketchInfo,
            lastSelectedSketch:fn.split('/home/pi')[1]
        }
        const blob = new Blob([JSON.stringify(newSketchInfo)], {type:"application/json"});
        const formData = new FormData();
        formData.append('file', blob,'.cache.json'); // appending file
        axios.post(`http://${window.location.hostname}:3000/upload/zynthian-my-data+++sessions+++`, formData ).then(res => { // then print response status
            setSketchInfo(newSketchInfo)
        });
    }

    async function saveCurrentSketchAs(destinationPath){
        // create the folder
        const fullPath = destinationPath + "/";
        // console.log(fullPath)
        const createFolderResponse = await fetch(`http://${window.location.hostname}:3000/createfolder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({fullPath})
        });
        const createFolderRes = await createFolderResponse.json();

        console.log(createFolderRes, " CREATE FOLDER RES")

        const sketchFileName = sketchInfo.lastSelectedSketch.split('/')[sketchInfo.lastSelectedSketch.split('/').length - 1];
        let sketchFolder = sketchInfo.lastSelectedSketch.split(sketchFileName)[0];
        if (sketchFolder.indexOf('/zynthian-my-data/') > -1) sketchFolder = sketchFolder.split('/zynthian-my-data/')[1];
        const filesInFolderResponse = await fetch(`http://${window.location.hostname}:3000/folder/${"+++home+++pi+++zynthian-my-data+++"+sketchFolder.split('/').join('+++').split(' ').join('%20')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const filesInFolderRes = await filesInFolderResponse.json();

        console.log(filesInFolderRes, " FILES IN FOLDER RES")
        console.log(fullPath)
        let previousPaths = [],
            destinationPaths = [];

        filesInFolderRes.forEach(function(file,index){
            let path = file.path.split('/home/pi/zynthian-my-data/' + sketchFolder)[1];
            if (path.indexOf('/') === -1){
                previousPaths.push(file.path);
                destinationPaths.push("/" + fullPath + (path.indexOf('.') > -1 && path !== ".cache" ? path : ""));
            }
        })

        console.log(previousPaths, destinationPaths)
        
        copyPasteFile(previousPaths,destinationPaths,false,0)

        // const previousPath = sketchInfo.lastSelectedSketch.replace('/zynthian/','/home/pi/');
        // const deleteOrigin = false;
        // const response = await fetch(`http://${window.location.hostname}:3000/copypaste`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body:JSON.stringify({previousPath,destinationPath,deleteOrigin})
        // });
        // const res = await response.json();
    }

    async function copyPasteFile(previousPaths,destinationPaths,deleteOrigin,index){

        console.log(previousPaths, destinationPaths, index)

        const previousPath = previousPaths[index]
        const destinationPath = destinationPaths[index];
        fetch(`http://${window.location.hostname}:3000/copypaste`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({previousPath,destinationPath,deleteOrigin})
        }).then(async function(res){
            console.log(res, " RES ")
          if (index ===  previousPaths.length - 1){

          } else {
            copyPasteFile(previousPaths,destinationPaths,deleteOrigin,index + 1)
          }
        })
      }


    function updateTrack(index,title,color,keyZoneMode,trackAudioType){

        const currentTrack = currentSketch.tracks[index]

        const newTrack = {
            ...currentTrack,
            name:title,
            color,
            keyzone_mode: keyZoneMode && keyZoneMode !== null ? keyZoneMode : currentTrack.keyzone_mode,
            trackAudioType: trackAudioType && trackAudioType !== null ? trackAudioType : currentTrack.trackAudioType
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

    async function updateTrackClips(actionType,index,clipIndex,filePath,multiple,isSaveAs){

        const track = currentSketch.tracks[index];
        let newTrack;

        if (actionType === "remove"){

            const fullPath = currentSketch.tracks[index].clips[clipIndex].path;
            const res = await fetch(`http://${window.location.hostname}:3000/delete`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body:JSON.stringify({fullPath})
            })
            const data = await res.json();
            
            newTrack = {
                ...track,
                clips:[
                    ...track.clips.slice(0,index),
                    {
                        ...track.clips[clipIndex],
                        path:null
                    },
                    ...track.clips.slice(index + 1,track.clips.length - 1)
                ]
            }
            // delete file - get file name + path, delete from server
            // update currentSketch.tracks[index].clips[clipIndex].path = null
        } else if (actionType === "insert"){
            console.log('insert clip into track')
        } else if (actionType === "upload"){
            console.log('upload clip to track')
        }
        const newCurrentSketch = {
            ...currentSketch,
            tracks:[
                ...currentSketch.tracks.slice(0,index),
                newTrack,
                ...currentSketch.tracks.slice(index + 1,currentSketch.tracks.length - 1)
            ]
        }
        setCurrentSketch(newCurrentSketch);
        saveCurrentSketch()
    }

    function onShowPatternEditor(trackIndex){
        setPatternEditorTrackIndex(trackIndex)
        setShowPatternEditor(true)
    }

    let tracksDisplay;
    if (tracks !== null){
        
        const defaultColor = "#000000";
        const sketchFileName = sketchInfo.lastSelectedSketch.split('/')[sketchInfo.lastSelectedSketch.split('/').length - 1];
        let sketchFolder = sketchInfo.lastSelectedSketch.split(sketchFileName)[0];
        if (sketchFolder.indexOf('/zynthian/') > -1) sketchFolder = "/" + sketchFolder.split('/zynthian/')[1];


        tracksDisplay = tracks.map((track,index) => {
            if (index < 10){
                return (
                    <Track 
                        key={index} 
                        index={index} 
                        color={track.color && track.color !== defaultColor ? track.color : colorsArray[index]}
                        updateTrack={updateTrack}
                        onShowPatternEditor={onShowPatternEditor}
                        track={track}
                        updateTrackClips={updateTrackClips}
                        sketchFolder={sketchFolder}
                    />
                )
            }
        })
    }

    let filePickerDisplay;
    if (showFilePicker === true){
        filePickerDisplay = (
            <SketchPadFileLoader 
                actionType={sketchPadDialogActionType}
                setShowLoadFromSketchPadDialog={setShowFilePicker}
                fileType={"sketch.json"}
                loadSketch={updateSketchInfo}
                saveSketch={saveCurrentSketchAs}
            />
        )

    }

    let patternEditorDisplay;
    if (showPatternEditor === true){
        patternEditorDisplay = (
            <Suspense fallback={<LoadingSpinner/>}>
                <PatternEditor 
                    trackIndex={patternEditorTrackIndex}
                />
            </Suspense>
        )
    }

    let sampleEditorStyle = {
        "height": window.innerHeight - 165
    }
    if (window.innerHeight < 865){
        sampleEditorStyle["overflow-y"] = "scroll"
    }

    return (
        <React.Fragment>
            <div className='sample-editor-menu'> 
                <ul>
                    <li><a>New</a></li>
                    <li><a onClick={() => {
                        setShowFilePicker(showFilePicker === true ? false : true)
                        setSketchPadDialogActionType('LOAD')
                    }}>Load</a></li>
                    <li><a onClick={saveCurrentSketch}>Save</a></li>
                    <li><a onClick={() => {
                        setShowFilePicker(showFilePicker === true ? false : true)
                        setSketchPadDialogActionType('SAVE')
                    }}>Save As...</a></li>
                    {sketchInfo !== null ? <li style={{float:"right"}}><a>{sketchInfo.lastSelectedSketch}</a></li>: ''}
                </ul>
            </div>
            <div id="sample-editor" style={sampleEditorStyle}>
                {tracksDisplay}
            </div>
            {filePickerDisplay}
            {patternEditorDisplay}
        </React.Fragment>
    )
}

export default SampleEditor