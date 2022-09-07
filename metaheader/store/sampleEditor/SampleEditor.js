import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { getSketchpad, getSketchpadInfo, saveSketchpad, updateSketchpadInfo } from './sampleEditorSlice';
import { setFilePicker } from '../filePicker/filePickerSlice';
import Channel from './Channel';
import FilePicker from '../filePicker/FilePicker';

const SampleEditor = ({colorsArray}) => {

    const { sketchpadInfo, sketchpad } = useSelector((state) => state.sampleEditor);
    const { showFilePicker } = useSelector(state => state.filePicker )
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getSketchpadInfo())
    },[])

    useEffect(() => {
        if (sketchpadInfo !== null){
            dispatch(getSketchpad())
        }
    },[sketchpadInfo])

    function handleLoadClick(){
        const filePickerFolder = sketchpadInfo.lastSelectedSketchpad.split(sketchpad.name)[0];
        dispatch(setFilePicker({folder:filePickerFolder,mode:'LOAD',type:'.sketchpad.json'}))
    }

    function handleFilePickerSelection(file){
        dispatch(updateSketchpadInfo({filePath:file.path,fileName:file.name}))
    }

    let channelsDisplay;
    if (sketchpad !== null){
        const defaultColor = "#000000";
        const { lastSelectedSketchpad } = sketchpadInfo;
        const sketchFileName = lastSelectedSketchpad.split('/')[lastSelectedSketchpad.split('/').length - 1];
        let sketchFolder = lastSelectedSketchpad.split(sketchFileName)[0];
        if (sketchFolder.indexOf('/zynthian/') > -1) sketchFolder = "/" + sketchFolder.split('/zynthian/')[1];
        channelsDisplay = sketchpad.channels.map((channel,index) => (
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
                    {/* <li><a onClick={() => {
                        setShowFilePicker(showFilePicker === true ? false : true)
                        setSketchPadDialogActionType('SAVE')
                    }}>Save As...</a></li> */}
                    {sketchpadInfo !== null ? <li style={{float:"right"}}><a>{sketchpadInfo.lastSelectedSketchpad}</a></li>: ''}
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