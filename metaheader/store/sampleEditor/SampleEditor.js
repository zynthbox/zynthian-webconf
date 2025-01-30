import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { copyPasteSamples, copyPasteSampleSet, getSketchpad, getSketchpadInfo, saveSketchpad, updateSketchpadInfo } from './sampleEditorSlice';
import { setFilePicker } from '../filePicker/filePickerSlice';
import Channel from './Channel';
import FilePicker from '../filePicker/FilePicker';

const SampleEditor = ({colorsArray}) => {

    const { sketchpadInfo, sketchpad, pendingFiles } = useSelector((state) => state.sampleEditor);
    const { showFilePicker, mode, type  } = useSelector(state => state.filePicker )
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getSketchpadInfo())
    },[])

    useEffect(() => {
        if (sketchpadInfo !== null){
            dispatch(getSketchpad())
        }
    },[sketchpadInfo])

    useEffect(() => {
        if (pendingFiles.files !== null){
            const { files, channelIndex } = pendingFiles;
            dispatch(copyPasteSamples({files,channelIndex}))
        }
    },[pendingFiles])

    function handleLoadClick(){
        
        //const filePickerFolder = sketchpadInfo.lastSelectedSketchpad.split(sketchpad.name)[0];    
        const filePickerFolder = '/zynthian/zynthian-my-data/sketchpads/my-sketchpads/';                
        dispatch(setFilePicker({folder:filePickerFolder,mode:'LOAD',type:'.sketchpad.json'})) 
    }

    function handleFilePickerSelection(val,channelIndex,sampleIndex){
        if (type === ".sketchpad.json"){
            if (mode === "SAVE"){
                const filePath = val;
                const fileName = filePath.split('/')[filePath.split('/').length - 1].split('.sketchpad.json')[0]
                dispatch(saveSketchpad("/" + filePath.split('/zynthian/')[1]))
                dispatch(updateSketchpadInfo({filePath,fileName}))
            } else {
                const file = val;
                dispatch(updateSketchpadInfo({filePath:file.path,fileName:file.name}))
            }
        } else if (type === '.wav'){
            if (mode === "LOAD"){
                dispatch(
                    copyPasteSamples({files:[val],channelIndex,sampleIndex})
                )
            }
        } else if (type === 'sample-bank.json'){
            if (mode === "LOAD"){
                dispatch(
                    copyPasteSampleSet({sampleSet:val,channelIndex})
                )
            }
        }
    }

    function handleSaveSketchpadAs(){
        const filePickerFolder = sketchpadInfo.lastSelectedSketchpad.split(`${sketchpad.name}.sketchpad.json`)[0];
        dispatch(setFilePicker({folder:filePickerFolder,mode:'SAVE',type:'.sketchpad.json'}))
    }

    let channelsDisplay;
    if (sketchpad !== null){
        const defaultColor = "#000000";
        const { lastSelectedSketchpad } = sketchpadInfo;
        const sketchFileName = lastSelectedSketchpad.split('/')[lastSelectedSketchpad.split('/').length - 1];
        let sketchFolder = lastSelectedSketchpad.split(sketchFileName)[0];     
        if (sketchFolder.indexOf('/zynthian/') > -1) sketchFolder = "/" + sketchFolder.split('/zynthian/')[1];
        channelsDisplay = sketchpad.tracks.map((channel,index) => (
            <Channel
                key={index} 
                index={index} 
                color={channel.color && channel.color !== defaultColor ? channel.color : colorsArray[index]}
                channel={channel}              
            />
        ))
    }

    let sampleEditorStyle = { "height": window.innerHeight - 165 }
    if (window.innerHeight < 865) sampleEditorStyle["overflow-y"] = "scroll"

    let filePickerDisplay;
    if (showFilePicker === true){
        filePickerDisplay = (
            <FilePicker 
                onSelectFile={handleFilePickerSelection}
            />
        )
    }

    return (
        <React.Fragment>
            <div className='sample-editor-menu'> 
                <ul>
                    <li><a>New</a></li>
                    <li><a onClick={() => handleLoadClick()}>Load</a></li>
                    <li><a onClick={() => dispatch(saveSketchpad())}>Save</a></li>
                    <li><a onClick={() => {handleSaveSketchpadAs()}}>Save As...</a></li>
                    {sketchpadInfo !== null ? 
                        <li style={{float:"right"}}>
                        <a>{sketchpadInfo.lastSelectedSketchpad.substring(sketchpadInfo.lastSelectedSketchpad.indexOf('my-sketchpads'))}</a></li>: ''}
                </ul>
            </div>
            <div id="sample-editor" style={sampleEditorStyle}>
                {channelsDisplay}
            </div>
            {filePickerDisplay}
        </React.Fragment>
    )
}

export default SampleEditor