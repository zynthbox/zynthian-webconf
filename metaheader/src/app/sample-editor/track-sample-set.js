import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'
import axios from 'axios';
import { AiFillSave } from 'react-icons/ai'
import Sample from './sample';
import SketchPadFileLoader from './sketch-pad-file-loader';

const TrackSampleSet = (props) => {

    const { index, samples, setSamples, samplesArray, getTrackSampleSet } = props

    const [ dragZoneContainerCssClass, setDragZoneContainerCssClass ] = useState('hidden')
    const [ showSampleSetSourcePicker, setShowSampleSetSourcePicker ] = useState(false)
    const [ showSampleSetDropZone, setShowSampleSetDropZone ] = useState(false)
    const [ sketchPadDialogActionType, setSketchPadDialogActionType ] = useState("LOAD")
    const [ showLoadFromSketchPadDialog, setShowLoadFromSketchPadDialog ] = useState(false)
    const [ loadFromSketchPadSampleIndex, setLoadFromSketchPadSampleIndex ] = useState(null)
    const [ loadFromSketchPadFileType, setLoadFromSketchPadFileType ] = useState('wav')

    const selectedFolder = `/zynthian-my-data/sketches/my-sketches/temp/wav/sampleset/bank.${index+1}/`

    useEffect(() => {
        if (showSampleSetDropZone === true){
            setShowSampleSetSourcePicker(false);
        }
    },[showSampleSetDropZone])

    useEffect(() => {
        if (loadFromSketchPadSampleIndex !== null){
            setShowSampleSetSourcePicker(true)
        }
    },[loadFromSketchPadSampleIndex])

    function addSample(file){
        setShowSampleSetSourcePicker(false)
        let sampleIndexToReplace = loadFromSketchPadSampleIndex;
        if (loadFromSketchPadSampleIndex === null){
            sampleIndexToReplace = samples.findIndex((sample) => sample === null);
            if (!sampleIndexToReplace || sampleIndexToReplace === null) sampleIndexToReplace = 0;
        }
        const newSamples = [ ...samples.slice(0,sampleIndexToReplace), file, ...samples.slice(sampleIndexToReplace + 1, samples.length)]
        setSamples(newSamples)
        setLoadFromSketchPadSampleIndex(null)
    }

    async function onUploadSample(sample,sIndex,isInsert){
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

    async function onInsertSample(filePath,sIndex,multiple,isSaveAs){
        // console.log('ON INSERT SAMPLE')
        setLoadFromSketchPadSampleIndex(null)
        const fileName = filePath.split('/')[filePath.split('/').length - 1];
        const sPath = fileName;
        // console.log(fileName,"fileName")
        const response = await fetch(`http://${window.location.hostname}:3000/track/${(index+1)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({sIndex,sPath})
        });
        const res = await response.json()
        insertSample(filePath,fileName,sIndex,multiple,isSaveAs)
    }

    async function insertSample(filePath,fileName,sIndex,multiple,isSaveAs){

        const previousPath = isSaveAs === true ? "/home/pi" + selectedFolder + fileName : filePath
        const destinationPath =  isSaveAs === true ? filePath.split("/pi")[1] :  selectedFolder + fileName 

        const deleteOrigin = false;
        const response = await fetch(`http://${window.location.hostname}:3000/copypaste`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({previousPath,destinationPath,deleteOrigin})
        });
        const res = await response.json()

        if (multiple === true){
            if (sIndex === samples.length - 1) getTrackSampleSet()
        } else getTrackSampleSet()
    }

    function removeAllSamples(){
        samples.forEach(function(sample,index){
            let fetchSamples = false;
            if (index === samples.length - 1) fetchSamples = true;
            removeSample(sample,index,fetchSamples)
        });
    }

    function saveSampleSetAs(){
        setSketchPadDialogActionType("SAVE")
        setShowLoadFromSketchPadDialog(true)
    }

    async function loadSampleSet(file){
        const sampleSetIndex = file.path.split('bank.')[1];
        const path = file.path.split('/').join('+++')
        const response = await fetch(`http://${window.location.hostname}:3000/json/${path}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const res = await response.json()
        const baseFilePath = "/home/pi" + selectedFolder.split(index + 1)[0] + sampleSetIndex;


        res.forEach(function(sample,sIndex){
            // console.log(sample,sIndex,"sample + sIndex on forEach in load")
            if (sample !== null){
                onInsertSample(baseFilePath + sample.path,sIndex,true)
            } else {
                if (sIndex === samples.length - 1) getTrackSampleSet()
            }
        })
    }

    function saveSampleSet(dirPath){

        const fullPath = dirPath.split('/pi')[1]

        fetch(`http://${window.location.hostname}:3000/createfolder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({fullPath})
        }).then(async function(res){
            const response = await res.json()
            samples.forEach(function(sample,sIndex){
                // console.log(sample,sIndex,"sample + sIndex on forEach in load")
                if (sample !== null){
                    onInsertSample(dirPath + sample.path,sIndex,true,true)
                }
            })
        });
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

    function onSampleSetPlusClick(){

        setLoadFromSketchPadFileType("json")

        setShowSampleSetDropZone(false)
        setShowSampleSetSourcePicker(showSampleSetSourcePicker === true ? false : true)
    }

    function onLoadFromExternalMachineClick(){
        setShowSampleSetDropZone(true)
        setShowSampleSetSourcePicker(false)
    }

    function onLoadFromSketpchPadClick(){
        setSketchPadDialogActionType("LOAD")
        setShowLoadFromSketchPadDialog(true)
        setShowSampleSetSourcePicker(false)
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

    const samplesDisplay = samplesArray.map((sample,i) => (
        <Sample 
            key={i} 
            index={i} 
            sample={samples[i]} 
            trackIndex={index} 
            removeSample={removeSample}
            addSample={addSample}
            uploadSample={onUploadSample}
            setLoadFromSketchPadSampleIndex={setLoadFromSketchPadSampleIndex}
            setLoadFromSketchPadFileType={setLoadFromSketchPadFileType}
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

    let sampleSetSourcePickerDisplay;
    if (showSampleSetSourcePicker === true){

        let lfxeDisplay = (
            <a className='button' onClick={onLoadFromExternalMachineClick}>
                Load from External Machine
            </a>
        )

        if (loadFromSketchPadSampleIndex !== null){
            lfxeDisplay = (
                <a className='button'>
                    <input type="file" 
                        onChange={(e) => addSample(e.target.files[0],loadFromSketchPadSampleIndex)}
                    />
                    Load from External Machine
                </a>

            )
        }

        sampleSetSourcePickerDisplay = (
            <div className="sample-set-upload-container source-picker">
                <a className='button' onClick={onLoadFromSketpchPadClick}>
                    Load from Sketchpad
                </a>
                {lfxeDisplay}
            </div>
        )
    }

    let sampleSetLoadFromSketchPadDialogDisplay;
    if (showLoadFromSketchPadDialog === true){

        let sampleIndexToReplace = loadFromSketchPadSampleIndex;
        if (loadFromSketchPadSampleIndex === null){
            sampleIndexToReplace = samples.findIndex((sample) => sample === null);
            if (!sampleIndexToReplace || sampleIndexToReplace === null) sampleIndexToReplace = 0;
        }

        sampleSetLoadFromSketchPadDialogDisplay = (
            <SketchPadFileLoader 
                actionType={sketchPadDialogActionType}
                setShowLoadFromSketchPadDialog={setShowLoadFromSketchPadDialog}
                insertSample={onInsertSample}
                loadSampleSet={loadSampleSet}
                saveSampleSet={saveSampleSet}
                sampleIndex={sampleIndexToReplace}
                fileType={loadFromSketchPadFileType}
            />
        )
    }

    return (
        <React.Fragment>
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
                <li><a onClick={() => saveSampleSetAs()}> <AiFillSave/> </a></li>
                <li style={{float:"right"}}><a onClick={onSampleSetPlusClick}><i className="glyphicon glyphicon-plus"></i></a></li>
            </ul>
            {sampleSetUploadDisplay}
            {sampleSetSourcePickerDisplay}
            {sampleSetLoadFromSketchPadDialogDisplay}
        </React.Fragment>
    )
}

export default TrackSampleSet