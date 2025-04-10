import React, { useEffect, useState, useRef } from 'react'

import axios from 'axios';

import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';

import { useOnClickOutside, getFormData } from '../helpers';
import { FaWindowClose } from 'react-icons/fa';
import LoadingSpinner from '../loading-spinner';

const FileViewer = (props) => {
 
    const { file, setShowFileViewer, selectedFolder } = props;

    const ref = useRef();
    useOnClickOutside(ref, () => setShowFileViewer(false));

    const fileType = file.path.split('.')[file.path.split('.').length - 1];

    const [ data, setData ] = useState(null)
    const [ loading, setLoading ] = useState(true)

    useEffect(() => {
        getFile()
    },[])

    function getFile(){
        if (fileType === "json"){
            getJson()
        }
    }

    async function getJson(){
        const response = await fetch(`http://${window.location.hostname}:3000/json/${file.path.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
          });
          const res = await response.json();

          console.log(res, " GET JSON RES")

          setData(res)
          setLoading(false)
    }

    async function updateJson(json){
        var f = new File([json], file.name,  { type: "application/json" });
        var formData = new FormData();
        formData.append("file", f, file.name);
        const filePath = file.path.split('/home/pi')[1].split(file.name)[0]
        // console.log(filePath, " FILE PATH")
        const url = `http://${window.location.hostname}:3000/upload/${filePath.split("/").join('+++')}`
        axios.post(url, formData ).then(res => {
            console.log("JSON UPDATED!")
            console.log(res, " RES ");
        });
    }

    function onJsonChange(val){
        updateJson(val.json)
    }

    let fileViewerDisplay = <LoadingSpinner/>
    if (fileType === "json" && loading === false){
        fileViewerDisplay = (
            <div className='json-viewer-container'>
                {/* <ReactJson src={data} theme="monokai"/> */}
                <JSONInput
                    id= {file.path}
                    placeholder={ data }
                    locale={ locale }
                    height='100%'
                    width='100%'
                    onChange={onJsonChange}
                />
            </div>
        )
    }

    return (
        <div ref={ref} id="file-viewer">
            <a className='close-file-viewer' onClick={() => setShowFileViewer(false)}>
                <FaWindowClose/>
            </a>
            {fileViewerDisplay}
        </div>
    )
}

export default FileViewer