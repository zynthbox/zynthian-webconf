import React, { useState, useEffect, useRef } from 'react'
import { AiFillFolder, AiFillFolderOpen } from 'react-icons/ai'
import { VscJson } from 'react-icons/vsc'
import { BsFillFileEarmarkMusicFill, BsFillFileEarmarkFill, BsPersonPlus } from 'react-icons/bs'
import { FaWindowClose } from 'react-icons/fa'
import { useOnClickOutside } from '../helpers';

const SketchPadFileLoader = (props) => {

    let initFolderPath = "/home/pi/zynthian-my-data/sketches/my-sketches/";
    const [ fileList, setFileList ] = useState(null)
    const [ folderPath, setFolderPath ] = useState(initFolderPath)
    const [ folderName, setFolderName ] = useState('')
    const [ selectedFile, setSelectedFile ] = useState(null)
    
    useEffect(() => {
        getSketchPadFiles()
    },[])

    useEffect(() => {
        if (folderPath !== null){
            setFileList(null)
            getSketchPadFiles()
        }
    },[folderPath])

    async function getSketchPadFiles(){

        const response = await fetch(`http://${window.location.hostname}:3000/folder/${folderPath.split('/').join('+++').split(' ').join('%20')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();

        setFileList(res)
    }

    function selectFileFromSketchPad(file,fileType){
        // const newFolderPath = folderPath + file.path.split(folderPath)[1];
        // setFolderPath(newFolderPath)

        if (file.isDir === true){
            setFolderPath(file.path + "/")
        } else {

            if (props.actionType === "LOAD"){
                if (fileType === "json"){
                    if (props.fileType === "json"){
                        props.loadSampleSet(file)
                        props.setShowLoadFromSketchPadDialog(false)
                    } else if (props.fileType === "sketch.json" && file.path.indexOf('sketch.json') > -1){
                        props.loadSketch(file.path)
                        props.setShowLoadFromSketchPadDialog(false)
                    }
                } else if (props.fileType === "wav" && fileType === "wav" || props.fileType === "wav" && fileType === "mp3")  {
                    props.insertSample(file.path,props.sampleIndex)
                    props.setShowLoadFromSketchPadDialog(false)
                } else {
                    const newFolderPath = file.path.split('zynthian-my-data/')[1];
                    setFolderPath(newFolderPath) 
                }

            } else if (props.actionType === "SAVE"){
                const newFolderPath = file.path.split('zynthian-my-data/')[1];
                setFolderPath(newFolderPath)
            }
        }
    }

    function onSaveAsClick(folderName){

        if (props.fileType === "json"){
            let destPath = folderPath + folderName;

            props.saveSampleSet(destPath)
            props.setShowLoadFromSketchPadDialog(false)
        } else if (props.fileType === "sketch.json"){

            console.log('on save sketch json')

            props.setShowLoadFromSketchPadDialog(false)
            props.saveSketch(folderPath.split('/home/pi/')[1] + folderName)
        }
    }

    function goBack(){
        
        let newFolderPath;
        if (folderPath.indexOf('/') > -1){
            const lastFolderInChain = folderPath.split("/")[folderPath.split("/").length - 2]
            newFolderPath = folderPath.split("/" + lastFolderInChain)[0] + "/";
        } else {
            newFolderPath = initFolderPath;
        }
        setFolderPath(newFolderPath);
    }

    let fileListDisplay;
    if (fileList !== null){
        fileListDisplay = fileList.map((f,index) => {
            let showItem = true
            let iconDispaly = <AiFillFolder/>
            let fileType = ""
            let relPath = f.path;
            relPath = f.path.split(folderPath)[1];
            if (relPath && relPath[0] === "/") relPath = relPath.substring(1)
            if (relPath && relPath.split('/').length > 1) showItem = false;
            if (relPath && relPath.indexOf('.') > -1){
                fileType = relPath.split('.')[relPath.split('.').length - 1]; 
                iconDispaly = <BsFillFileEarmarkFill/>
                if (fileType === "json"){
                    if (props.fileType === "wav" || props.fileType === "mp3") showItem = false;
                    else {
                        iconDispaly = <VscJson/>
                        if (relPath.indexOf('sketch.json') > -1){
                            if (props.fileType === "json") showItem = false;
                        } else {
                            if (props.fileType === "sketch.json") showItem = false;
                        }
                    }
                } else if (fileType === "wav" || fileType === "mp3"){
                    if (props.fileType === "json") showItem = false;
                    else iconDispaly = <BsFillFileEarmarkMusicFill/>
                } else if (fileType === "cache") {
                    showItem = false
                }
            }
            
            if (showItem === true){
                return (
                    <li key={index}>
                        <a onClick={() => setSelectedFile(relPath,fileType)} className={relPath === selectedFile ? "active" : ""} onDoubleClick={() => selectFileFromSketchPad(f,fileType)}>{iconDispaly} {relPath}</a>
                    </li>
                )
            }
        })
    }

    const ref = useRef();
    useOnClickOutside(ref, e => {
        props.setShowLoadFromSketchPadDialog(false)
    });

    let goBackDisplay;
    if (folderPath !== initFolderPath){
        goBackDisplay = <li><a onDoubleClick={() => goBack()}><AiFillFolderOpen/> ...</a></li>
    }

    let bottomSaveInput,
        containerCssClass = 'sample-set-load-from-sketch-pad-dialog'
    if (props.actionType === "SAVE"){
        containerCssClass += " w-save"
        bottomSaveInput = (
            <div className='dialog-footer'>
                <input value={folderName} onChange={(e) => setFolderName(e.target.value)} type="text" />
                <button onClick={() => onSaveAsClick(folderName)}>Save</button>
            </div>
        )
    }

    let itemType = "FILE";
    if (props.fileType === "json") itemType = "SAMPLESET"
    else if (props.fileType === "sketch.json") itemType = "SKETCH"

    return (
        <div  ref={ref} className={containerCssClass}>
            <a className='close' onClick={() => props.setShowLoadFromSketchPadDialog(false)}>
                <FaWindowClose/>
            </a>
            <h4>{props.actionType} {itemType} FROM SKETCH PAD</h4>
            <ul>
                {goBackDisplay}
                {fileListDisplay}
            </ul>
            {bottomSaveInput}
        </div>
    )
}

export default SketchPadFileLoader