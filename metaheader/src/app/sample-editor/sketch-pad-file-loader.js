import React, { useState, useEffect, useRef } from 'react'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { useOnClickOutside } from '../helpers';

const SketchPadFileLoader = (props) => {

    const [ fileList, setFileList ] = useState(null)

    console.log(fileList,"file list")

    useEffect(() => {
        getSketchPadFiles()
    },[])

    async function getSketchPadFiles(){

        const sketchPadFolder = "capture/"

        const response = await fetch(`http://${window.location.hostname}:3000/mydata/${sketchPadFolder}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();
        setFileList(res)
    }

    function selectFileFromSketchPad(file){
        const sPath = file.path.split('/').join('%');
        console.log(sPath)
        props.insertSample(sPath,props.sampleIndex)
        props.setShowLoadFromSketchPadDialog(false)
    }

    let fileListDisplay;
    if (fileList !== null){
        fileListDisplay = fileList.map((f,index) => (
            <li><a onClick={() => selectFileFromSketchPad(f)}>{f.path.split('/')[f.path.split('/').length - 1]}</a></li>
        ))
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
            <h4>LOAD FROM SKETCH PAD</h4>
            <ul>
                {fileListDisplay}
            </ul>
        </div>
    )
}

export default SketchPadFileLoader