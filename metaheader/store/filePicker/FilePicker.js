import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from "react-redux";
import { hideFilePicker, getFolderFiles, setSelectedFile, setFolder } from './filePickerSlice'

import { AiFillFolder, AiFillFolderOpen } from 'react-icons/ai'
import { VscJson } from 'react-icons/vsc'
import { BsFillFileEarmarkMusicFill, BsFillFileEarmarkFill, BsPersonPlus } from 'react-icons/bs'
import { FaWindowClose } from 'react-icons/fa'
import { useOnClickOutside } from '../../src/app/helpers';

const FilePicker = (props) => {
    const dispatch = useDispatch()
    const { folder, initFolder, mode, files, selectedFile, type, channelIndex, sampleIndex } = useSelector(state => state.filePicker)
    const [ fileName, setFileName ] = useState('')

    useEffect(() => {
        if (folder !== null) dispatch(getFolderFiles())
    },[folder])

    const ref = useRef();
    useOnClickOutside(ref, e => {
        dispatch(hideFilePicker())
    });

    function onSelectFile(file){
        dispatch(hideFilePicker())
        props.onSelectFile(file,channelIndex,sampleIndex)
    }

    function handleSelectedFile(file,fileType){
        if (fileType === "folder" || fileType === "cache"){
            dispatch(setFolder(file.path + "/"))
        } else {
            onSelectFile(file)
        }
    }

    function handleSaveAsClick(){
        onSelectFile(folder + fileName + type)
    }

    function handleGoBack(){
        let folderName = folder.split('/')[folder.split('/').length - 2] + "/";
        let newFolder = folder.split(folderName)[0]
        dispatch(setFolder(newFolder))
    }

    let bottomSaveInput,
        containerCssClass = 'sample-set-load-from-sketch-pad-dialog'
    if (mode === "SAVE"){
        containerCssClass += " w-save"
        bottomSaveInput = (
            <div className='dialog-footer'>
                <input value={fileName} onChange={(e) => setFileName(e.target.value)} type="text" />
                <button onClick={() => handleSaveAsClick(fileName)}>Save</button>
            </div>
        )
    }

    let filesDisplay =  <li><a>{`No files of type ${type} were found`}</a></li>
    if (files !== null && files.length > 0){
        filesDisplay = files.map((file,index)=> {
            let iconDispaly = <AiFillFolder/>
            let fileType = "folder"
            if (file.isDir === false ){
                fileType = file.name.split('.')[file.name.split('.').length - 1];
                if (fileType === 'wav') iconDispaly = <BsFillFileEarmarkMusicFill/>
                else if (fileType === 'json') iconDispaly = <VscJson/>
                else iconDispaly = <BsFillFileEarmarkFill/>
            }
            return (
                <li key={index}>
                    <a onClick={() => dispatch(setSelectedFile(file.name))}
                        className={file.name === selectedFile ? "active" : ""} 
                        onDoubleClick={() => handleSelectedFile(file,fileType)}
                        >
                        {iconDispaly} {file.name}
                    </a>
                </li>
            )   
        })
    }

    let goBackDisplay;
    if (folder !== initFolder){
        goBackDisplay = <li><a onDoubleClick={() => handleGoBack()}><AiFillFolderOpen/>...</a></li>
    }

    return (
        <div  ref={ref} className={containerCssClass}>
            <a className='close' onClick={() => dispatch(hideFilePicker())}>
                <FaWindowClose/>
            </a>
            <h4>{mode} FROM SKETCH PAD</h4>
            <ul>
                {goBackDisplay}
                {filesDisplay}
            </ul>
            {bottomSaveInput}
        </div>
    )
}

export default FilePicker