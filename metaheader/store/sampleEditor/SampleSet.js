import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { AiFillSave } from 'react-icons/ai';
import Sample from './Sample';
import { removeSamples, setDropZone, setSourcePicker, uploadSamples } from './sampleEditorSlice';
import { setFilePicker } from '../filePicker/filePickerSlice';
import { FaWindowClose } from 'react-icons/fa';
import Dropzone from 'react-dropzone'

const SampleSet = ({index,samples,sampleSetMode,keyZoneMode}) => {

    const dispatch = useDispatch()
    const { sketchpad, sketchpadInfo, sourcePicker, dropZone } = useSelector((state) => state.sampleEditor);
    
    useEffect(() => {
        window.addEventListener('keydown',handleKeyPress,false);
        return () => {
            window.removeEventListener('keydown',handleKeyPress,false)
        }
    },[])

    function handleKeyPress(e){
        if (e.key === "Escape"){
            dispatch(setSourcePicker({showSourcePicker:false}))
            dispatch(setDropZone({showDropZone:false}))
        }
    }

    let hideMaskTimeout;

    function onSampleListDragOver(){
        clearTimeout(hideMaskTimeout)
        dispatch(setDropZone({
            showDropZone:true,
            channelIndex:index,
            isSampleSet:false
        }))
    }

    function onSampleListDragExit(){
        hideMaskTimeout = setTimeout(() => {
            dispatch(setDropZone({
                showDropZone:false
            }))        
        }, 10);
    }

    function onAddSample(sampleIndex){
        dispatch(
            setSourcePicker({
                channelIndex:index,
                sampleIndex,
                showSourcePicker:true
            })
        )
    }
    
    function handlePickFromInternal(sampleIndex){
        dispatch(setFilePicker({
            folder:sketchpadInfo.lastSelectedSketchpad.split(`${sketchpad.name}.sketchpad.json`)[0],
            mode:'LOAD',
            type: sampleIndex || sampleIndex === 0 ? '.wav':'sample-bank.json' ,
            sampleIndex: sampleIndex,
            channelIndex: index
        }))
        dispatch(setSourcePicker({showSourcePicker:false}))
    }

    function handleAddSample(file,sampleIndex){
        dispatch(uploadSamples({files:[file],channelIndex:index,sampleIndex}))
    }
    
    function onAddSamples(){
        dispatch(
            setSourcePicker({
                channelIndex:index,
                showSourcePicker:true,
            })
        )
    }

    function handleLoadSamplesFromExternal(){
        dispatch(setSourcePicker({showSourcePicker:false}))
        dispatch(
            setDropZone({
                channelIndex:index,
                isSampleSet:true,
                showDropZone:true
            })
        )
    }

    function handleDropSampleSet(files){
        dispatch(uploadSamples({files:files,channelIndex:index}))
    }

    function handleRemoveSample(sampleIndex){
        dispatch(removeSamples({channelIndex:index,sampleIndex}))
    }

    function handleRemoveAllSamples(){
        dispatch(removeSamples({channelIndex:index}))
    }

    function handleSaveSampleSetAs(){
        // console.log('SAVE SAMPLE SET AS SUKKKAAAA')
    }

    const samplesDisplay = samples.map((sample,i) => (
        <Sample 
            key={i} 
            index={i} 
            sample={sample}
            channelIndex={index}
            sampleSetMode={sampleSetMode}
            onRemoveSample={handleRemoveSample}
            onAddSample={onAddSample}
        />
    ))

    let sampleSetSourcePickerDisplay;
    if (sourcePicker.channelIndex == index && sourcePicker.showSourcePicker === true){

        let lfxeDisplay = (
            <a className='button' onClick={handleLoadSamplesFromExternal}>
                Load from External
            </a>
        )

        if (sourcePicker.sampleIndex){
            lfxeDisplay = (
                <a className='button'>
                    <input type="file" 
                        onChange={(e) => handleAddSample(e.target.files[0],sourcePicker.sampleIndex)}
                    />
                    Load from External
                </a>
            )
        }

        sampleSetSourcePickerDisplay = (
            <div className="sample-set-upload-container source-picker">
                <a className='close-source-picker'
                   onClick={() => dispatch(setSourcePicker({showSourcePicker:false}))}>
                    <FaWindowClose/>
                </a>
                <a className='button' onClick={() => handlePickFromInternal(sourcePicker.sampleIndex)}>
                    Pick from Internal
                </a>
                {lfxeDisplay}
            </div>
        )
    }

    let sampleSetUploadDisplay;
    if (dropZone.channelIndex == index && dropZone.isSampleSet === true && dropZone.showDropZone === true){
        sampleSetUploadDisplay = (
            <div className="sample-set-upload-container">
                <div className={"dropzone-container"}>
                    <Dropzone onDrop={acceptedFiles => handleDropSampleSet(acceptedFiles)}>
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

    let dragZoneContainerCssClass = "hidden"
    if (dropZone.showDropZone === true && dropZone.channelIndex == index && dropZone.isSampleSet == false){
        dragZoneContainerCssClass = ""
    }

    let nextFreeSampleSlot = sketchpad.channels[index].samples.indexOf(null)
    if (nextFreeSampleSlot == -1) nextFreeSampleSlot = sketchpad.channels[index].samples.length - 1    

    return (
        <React.Fragment>
            <div className={"sample-list-container " + (sampleSetMode === "sample-loop" ? "show-clips" : "")}  onDragOver={onSampleListDragOver} onDragLeave={onSampleListDragExit}>
                <div className={"dropzone-container " + dragZoneContainerCssClass}>
                    <Dropzone onDrop={acceptedFiles => handleAddSample(acceptedFiles[0],nextFreeSampleSlot)}>
                        {({getRootProps, getInputProps}) => (
                            <section>
                            <div {...getRootProps()}>
                                <a onClick={() => onSampleListDragExit(false)} className='close-source-picker'>
                                    <FaWindowClose/>
                                </a>
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
                <li><a onClick={() => handleRemoveAllSamples()}><i style={{marginTop:"1px"}} className="glyphicon glyphicon-trash"></i></a></li>
                <li><a onClick={() => handleSaveSampleSetAs()}> <AiFillSave/> </a></li>
                <li style={{float:"right"}}><a onClick={onAddSamples}><i className="glyphicon glyphicon-plus"></i></a></li>
            </ul>

            {sampleSetSourcePickerDisplay}
            {sampleSetUploadDisplay}
            {/* 
            {sampleSetUploadDisplay}

            {sampleSetLoadFromSketchPadDialogDisplay} */}
        </React.Fragment>
    )
}

export default SampleSet