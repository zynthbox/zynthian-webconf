import React, { useState, useEffect } from 'react'

const SketchFilePicker = (props) => {

    const { setShowFilePicker, onSelect } = props;

    const [ fileList, setFileList ] = useState(null);

    useEffect(() => {
        getSketchFileList()
    },[])

    async function getSketchFileList(){
        const response = await fetch(`http://${window.location.hostname}:3000/sketchlist/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const res = await response.json();
        setFileList(res)
    }

    let fileListDisplay = "";
    if (fileList !== null){
        const list = fileList.map((f,index) => {
            if (f.indexOf('.sketch.json') > -1 ){
                return (
                    <li><a onClick={() => onSelect(f,true)}>{f}</a></li>
                )
            }
        })
        fileListDisplay = (
            <ul>
                {list}
            </ul>
        )
    }
    return (
        <React.Fragment>
        <div id="sample-editor-file-picker">
            <h4>Load Sketch File</h4>
            {fileListDisplay}
        </div>
        <div onClick={() => setShowFilePicker(false)} id="sample-editor-file-picker-overlay"></div>
        </React.Fragment>
    )
}

export default SketchFilePicker;