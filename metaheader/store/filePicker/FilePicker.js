import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from "react-redux";
import { hideFilePicker, getFolderFiles, setSelectedFile, setFolder } from './filePickerSlice'

import { AiFillFolder, AiFillFolderOpen } from 'react-icons/ai'
import { VscJson } from 'react-icons/vsc'
import { BsFillFileEarmarkMusicFill, BsFillFileEarmarkFill, BsPersonPlus } from 'react-icons/bs'
import { FaWindowClose } from 'react-icons/fa'
import { useOnClickOutside } from '../../src/app/helpers';

const FilePicker = ({onSelectFile}) => {
    const dispatch = useDispatch()
    const { folder, initFolder, mode, files, selectedFile, type } = useSelector(state => state.filePicker)

    // useEffect(() => {
    //     console.log('WHAT GET THAT FOCKKEN SHIAT NOW!!!')
    //     dispatch(getFolderFiles())
    // },[])

    useEffect(() => {
        if (folder !== null) dispatch(getFolderFiles())
    },[folder])

    // const [ fileList, setFileList ] = useState(null)
    // const [ folderPath, setFolderPath ] = useState(initFolderPath)
    // const [ folderName, setFolderName ] = useState('')
    // const [ selectedFile, setSelectedFile ] = useState(null)
    
    // useEffect(() => {
    //     getSketchPadFiles()
    // },[])

    // useEffect(() => {
    //     if (folderPath !== null){
    //         setFileList(null)
    //         getSketchPadFiles()
    //     }
    // },[folderPath])

    // async function getSketchPadFiles(){

    //     const response = await fetch(`http://${window.location.hostname}:3000/folder/${folderPath.split('/').join('+++').split(' ').join('%20')}`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //     });
    //     const res = await response.json();

    //     setFileList(res)
    // }

    // function selectFileFromSketchPad(file,fileType){
    //     // const newFolderPath = folderPath + file.path.split(folderPath)[1];
    //     // setFolderPath(newFolderPath)

    //     if (file.isDir === true){
    //         setFolderPath(file.path + "/")
    //     } else {

    //         if (props.actionType === "LOAD"){
    //             if (fileType === "json"){
    //                 if (props.fileType === "json"){
    //                     props.loadSampleSet(file)
    //                     props.setShowLoadFromSketchPadDialog(false)
    //                 } else if (props.fileType === "sketch.json" && file.path.indexOf('sketch.json') > -1){
    //                     props.loadSketch(file.path)
    //                     props.setShowLoadFromSketchPadDialog(false)
    //                 }
    //             } else if (props.fileType === "wav" && fileType === "wav" || props.fileType === "wav" && fileType === "mp3")  {
    //                 props.insertSample(file.path,props.sampleIndex)
    //                 props.setShowLoadFromSketchPadDialog(false)
    //             } else {
    //                 const newFolderPath = file.path.split('zynthian-my-data/')[1];
    //                 setFolderPath(newFolderPath) 
    //             }

    //         } else if (props.actionType === "SAVE"){
    //             const newFolderPath = file.path.split('zynthian-my-data/')[1];
    //             setFolderPath(newFolderPath)
    //         }
    //     }
    // }

    // function onSaveAsClick(folderName){

    //     if (props.fileType === "json"){
    //         let destPath = folderPath + folderName;

    //         props.saveSampleSet(destPath)
    //         props.setShowLoadFromSketchPadDialog(false)
    //     } else if (props.fileType === "sketch.json"){

    //         console.log('on save sketch json')

    //         props.setShowLoadFromSketchPadDialog(false)
    //         props.saveSketch(folderPath.split('/home/pi/')[1] + folderName)
    //     }
    // }

    const ref = useRef();
    useOnClickOutside(ref, e => {
        dispatch(hideFilePicker())
    });

    function handleSelectedFile(file,fileType){
        if (mode === "LOAD"){
            handleLoadSelectedFile(file,fileType)
        }
    }

    function handleLoadSelectedFile(file,fileType){
        if (fileType === "folder" || fileType === "cache"){
            dispatch(setFolder(file.path + "/"))
        } else {
            onSelectFile(file)
        }
    }

    function handleGoBack(){
        let folderName = folder.split('/')[folder.split('/').length - 2] + "/";
        let newFolder = folder.split(folderName)[0]
        dispatch(setFolder(newFolder))
    }

    // let itemType = "FILE";
    // if (props.fileType === "json") itemType = "SAMPLESET"
    // else if (props.fileType === "sketch.json") itemType = "SKETCH"


    let bottomSaveInput,
        containerCssClass = 'sample-set-load-from-sketch-pad-dialog'
    if (mode === "SAVE"){
        containerCssClass += " w-save"
        // bottomSaveInput = (
        //     <div className='dialog-footer'>
        //         <input value={folderName} onChange={(e) => setFolderName(e.target.value)} type="text" />
        //         <button onClick={() => onSaveAsClick(folderName)}>Save</button>
        //     </div>
        // )
    }

    let filesDisplay =  <li><a>{`No files of type ${type} were found`}</a></li>
    if (files !== null && files.length > 0){
        filesDisplay = files.map((file,index)=> {

            let iconDispaly = <AiFillFolder/>
            let fileType = "folder"
            
            if (file.name.indexOf('.') > -1){
                fileType = file.name.split('.')[file.name.split('.').length - 1];
                if (fileType !== 'cache'){
                    if (fileType === 'wav') iconDispaly = <BsFillFileEarmarkMusicFill/>
                    else if (fileType === 'json') iconDispaly = <VscJson/>
                    else iconDispaly = <BsFillFileEarmarkFill/>
                }
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
            {/* 
            <ul>
                {fileListDisplay}
            </ul>
            {bottomSaveInput} */}
            
        </div>
    )
}

export default FilePicker