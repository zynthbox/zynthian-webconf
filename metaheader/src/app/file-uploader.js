import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function FileUploader(props) {
  const reader = new FileReader();

  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    setFile(acceptedFiles[0]);
    reader.readAsDataURL(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const [file, setFile] = useState();
  console.log(file);
  const [fileData, setFileData] = useState();
  const [progress, setProgress] = useState(0);
  const [showImg, setShowImg] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  reader.addEventListener(
    'load',
    function () {
      // convert image file to base64 string
      setFileData(reader.result);
      setShowImg(true);
    },
    false
  );

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append('file', file); // appending file

    // const response = await fetch(`http://${window.location.hostname}:3000/upload`, {
    //   method: 'POST',
    //   headers: {
    //       'Content-Type': 'application/json',
    //   },
    //   body:JSON.stringify({formData})
    // });
    // const res = await response.json();
    // console.log(res,"res after upload file");

    axios.post(`http://${window.location.hostname}:3000/upload`, formData);
    
    //   {
    //     onUploadProgress: ProgressEvent => {
    //       let progress = Math.round(
    //         (ProgressEvent.loaded / ProgressEvent.total) * 100
    //       );
    //       setProgress(progress);
    //     },
    //   })
    //   .then(res => {
    //     props.onFinishUpload(res.data);
    //     setUploadSuccess(true);
    //   })
    //   .catch(err => console.log(err)
    };

  let uploadButtonDisplay;
  if (file) {
    if (uploadSuccess === false) {
      uploadButtonDisplay = (
        <a className="ui green button labeled icon" onClick={uploadFile}>
          <i className="upload icon"></i>
          Upload Files
        </a>
      );
    } else {
      uploadButtonDisplay = <i className="check icon"></i>;
    }
  }

  let textDisplay;
  if (showImg === false) {
    textDisplay = (
      <p>Drag 'n' drop some files here, or click to select files</p>
    );
  } else {
    textDisplay = '';
  }

  let fileListDisplay;
  if (file){
    fileListDisplay = <span>{file.name}</span>
  }

  return (
    <div id="file-uploader">
      <div
        className={'dropzone-container' + (showImg === true ? ' with-img' : '')}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the files here ...</p> : textDisplay}
      </div>
      {fileListDisplay}
      {uploadButtonDisplay}
    </div>
  );
}

export default FileUploader;
