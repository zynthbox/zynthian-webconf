import React, { useState, useEffect, useRef } from 'react'
import { AiFillFolder, AiFillFolderOpen } from 'react-icons/ai'
import { VscJson } from 'react-icons/vsc'
import { BsFillFileEarmarkMusicFill, BsFillFileEarmarkFill } from 'react-icons/bs'
import { FaWindowClose } from 'react-icons/fa'
import { useOnClickOutside } from '../helpers';

const SketchPadFileLoader = (props) => {

    let initFolderPath = props.fileType === "json" ? "sketches/my-sketches/temp/wav/": "capture/";
    if (props.actionType === "SAVE") initFolderPath = "/"
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

        const response = await fetch(`http://${window.location.hostname}:3000/mydata/${folderPath.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();
        setFileList(res)
    }

    function selectFileFromSketchPad(file){
        // const newFolderPath = folderPath + file.path.split(folderPath)[1];
        // setFolderPath(newFolderPath)
        if (props.actionType === "LOAD"){
            if (props.fileType === "wav"){
                props.insertSample(file.path,props.sampleIndex)
            } else {
                props.loadSampleSet(file)
            }
            props.setShowLoadFromSketchPadDialog(false)
        } else if (props.actionType === "SAVE"){
            const newFolderPath = file.path.split('zynthian-my-data/')[1];
            setFolderPath(newFolderPath)
        }
    }

    function onSaveSampleSetAsClick(){
        let destPath = "/home/pi/zynthian-my-data" + ( folderPath === "/" ? "" : "/") + folderPath + (folderPath === "/" ? "" : "/") + folderName + "/"
        props.saveSampleSet(destPath)
    }

    function goBack(){
        
        let newFolderPath;
        if (folderPath.indexOf('/') > -1){
            const lastFolderInChain = folderPath.split("/")[folderPath.split("/").length - 1]
            newFolderPath = folderPath.split("/" + lastFolderInChain)[0];
        } else {
            newFolderPath = initFolderPath;
        }
        
        setFolderPath(newFolderPath);
    }

    function highlightFile(){

    }

    let fileListDisplay;
    if (fileList !== null){
        
        const fp = props.actionType === "LOAD" ? folderPath : "zynthian-my-data/" + (folderPath !== initFolderPath ? folderPath + "/" : "")
        
        fileListDisplay = fileList.map((f,index) => {
            
            let relPath = f.path
            let showItem = true
            relPath = f.path.split(fp)[1];

            let iconDispaly = <AiFillFolder/>

            if (relPath && relPath.indexOf('/') > -1){
                showItem = false;
                if (props.actionType === "LOAD" && relPath.split('/').length === 2){
                    showItem = true;
                }
            }
            
            if (relPath && relPath.indexOf('.') > -1){
                
                showItem = false;
                const fileType = relPath.split('.')[relPath.split('.').length - 1];
                
                if (fileType === "json") iconDispaly = <VscJson/>
                else if (fileType === "wav") iconDispaly = <BsFillFileEarmarkMusicFill/>
                else iconDispaly = <BsFillFileEarmarkFill/>

                if (props.actionType === "SAVE" && relPath.split('/').length === 1){
                    showItem = true
                } else if (props.actionType === "LOAD"  && fileType  === props.fileType){
                    showItem = true
                }
            }

            if (showItem === true){
                return (
                    <li>
                        <a onClick={() => setSelectedFile(relPath)} className={relPath === selectedFile ? "active" : ""} onDoubleClick={() => selectFileFromSketchPad(f)}>{iconDispaly} {relPath}</a>
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
        goBackDisplay = <li><a onClick={() => goBack()}><AiFillFolderOpen/> ...</a></li>
    }

    let bottomSaveInput,
        containerCssClass = 'sample-set-load-from-sketch-pad-dialog'
    if (props.actionType === "SAVE"){
        containerCssClass += " w-save"
        bottomSaveInput = (
            <div className='dialog-footer'>
                <input value={folderName} onChange={(e) => setFolderName(e.target.value)} type="text" />
                <button onClick={() => onSaveSampleSetAsClick()}>Save</button>
            </div>
        )
    }

    return (
        <div  ref={ref} className={containerCssClass}>
            <a className='close' onClick={() => props.setShowLoadFromSketchPadDialog(false)}>
                <FaWindowClose/>
            </a>
            <h4>{props.actionType} {props.fileType === "wav" ? "FILE" : "SAMPLESET"} FROM SKETCH PAD</h4>
            <ul>
                {goBackDisplay}
                {fileListDisplay}
            </ul>
            {bottomSaveInput}
        </div>
    )
}

export default SketchPadFileLoader