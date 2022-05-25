import React, { useEffect, useState, useRef } from 'react'
import ReactJson from 'react-json-view';
import { useOnClickOutside } from '../helpers';
import { FaWindowClose } from 'react-icons/fa';
import LoadingSpinner from '../loading-spinner';

const FileViewer = (props) => {

    const { file, setShowFileViewer } = props;

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
          console.log(res, " JSON RES ");
          setData(res)
          setLoading(false)
    }

    let fileViewerDisplay = <LoadingSpinner/>
    if (fileType === "json" && loading === false){
        fileViewerDisplay = (
            <div className='json-viewer-container'>
                <ReactJson src={data} theme="monokai" />
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