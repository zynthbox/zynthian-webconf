import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function FileUploader(props) {

  const { selectedFolder, fsep } = props

  const reader = new FileReader();

  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    setFiles(acceptedFiles)
    setFile(acceptedFiles[0]);
    reader.readAsDataURL(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const [file, setFile] = useState();
  const [files, setFiles] = useState();
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
    for (var i = 0; i < files.length; ++i){
      console.log(files[i])
      formData.append('file', files[i]); // appending file
    }

    axios.post(`http://${window.location.hostname}:3000/upload/${selectedFolder.split(fsep).join('+++')}`, formData ).then(res => { // then print response status
      setFile(null)
      setFileData(null)
      props.setShowFileUploader(false)
      props.refreshFileManager(res.data)
    });
  
  };

  let uploadButtonDisplay;
  if (file) {
    if (uploadSuccess === false) {
      uploadButtonDisplay = (
        <button className="ui green button labeled icon" onClick={uploadFile}>
          Upload Files
        </button>
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

  let fileListDisplay, dropZoneDisplay;
  if (files){
    
    const filesList = files.map((f,index) => (
      <p key={index}>{f.name}</p>
    ))
    fileListDisplay = <div>{filesList}</div>

  } else {

    dropZoneDisplay = (
      <div
        className={'dropzone-container' + (showImg === true ? ' with-img' : '')}
        {...getRootProps()}
      >
        <input {...getInputProps()} name="file" />
        {isDragActive ? <p>Drop the files here ...</p> : textDisplay}
      </div>
    )

  }

  return (
    <React.Fragment>
    <div id="file-uploader">
      {dropZoneDisplay}
      {fileListDisplay}
      {uploadButtonDisplay}
    </div>
    </React.Fragment>
  );
}

export default FileUploader;