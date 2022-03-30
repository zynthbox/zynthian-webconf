import React, { useState, useEffect, useRef } from 'react'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { useOnClickOutside } from '../helpers';

const SketchPadFileLoader = (props) => {

    const initFolderPath = props.fileType === "json" ? "sketches/my-sketches/temp/wav/": "capture/";

    const [ fileList, setFileList ] = useState(null)
    const [ folderPath, setFolderPath ] = useState(initFolderPath)

    useEffect(() => {
        getSketchPadFiles()
    },[])

    useEffect(() => {
        if (folderPath !== null && folderPath !== initFolderPath){
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
        console.log(res,"res of sketch pad file picketr")
        setFileList(res)
    }

    function selectFileFromSketchPad(file){
        // const newFolderPath = folderPath + file.path.split(folderPath)[1];
        // setFolderPath(newFolderPath)
        const sPath = file.path.split('/').join('%');
        if (props.fileType === "wav"){
            props.insertSample(sPath,props.sampleIndex)
        } else {
            props.loadSampleSet(file)
        }
        props.setShowLoadFromSketchPadDialog(false)
    }

    let fileListDisplay;
    if (fileList !== null){
        fileListDisplay = fileList.map((f,index) => {

            const relPath = f.path.split(folderPath)[1];

            let showItem = true;
            if (relPath.indexOf('/') > -1){
                showItem = false;
                if (relPath.split('/').length === 2){
                    showItem = true;
                }
            }

            if (relPath.indexOf('.') > -1){
                showItem = false;
                if (relPath.split('.')[relPath.split('.').length - 1] === props.fileType){
                    showItem = true
                }
            }


            if (showItem === true){
                return (
                    <li>
                        <a onClick={() => selectFileFromSketchPad(f)}>{relPath}</a>
                    </li>
                )
            }
        })
    }

    const ref = useRef();
    useOnClickOutside(ref, e => {
        props.setShowLoadFromSketchPadDialog(false)
    });

    return (
        <div  ref={ref} className='sample-set-load-from-sketch-pad-dialog'>
            <a className='close' onClick={() => props.setShowLoadFromSketchPadDialog(false)}>
                <AiOutlineCloseCircle/>
            </a>
            <h4>LOAD {props.fileType === "wav" ? "FILE" : "SAMPLESET"} FROM SKETCH PAD</h4>
            <ul>
                {fileListDisplay}
            </ul>
        </div>
    )
}

export default SketchPadFileLoader