import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { RiDeleteBin6Fill } from 'react-icons/ri';
import { BiRename } from 'react-icons/bi';
import { ImUpload } from 'react-icons/im';
import { FaWindowClose } from 'react-icons/fa';

import { humanFileSize } from '../helpers';
import { DIRECTORIES } from '../components/globalState';

const ROOTDIR_SOUNDFONTS = '/zynthian/zynthian-my-data/soundfonts/';

const isAllowedToUpload =(files, rootDirectory)=>{  
    const dir = DIRECTORIES.filter(d=>d.rootDirectory==rootDirectory).pop();    
    if(dir && dir.allowedUploadTypes)
    {
      for (let file of files) {
        const fileName = file.name;
        const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();        
        if (!dir.allowedUploadTypes.includes(fileExt.toLowerCase())) {
          alert(`Current directory does not support: ${fileExt}, only ${dir.allowedUploadTypes}`);          
          return false;
        }
      }
    } 
    return true;
}


function FileUploader(props) {

  const { selectedFolder, fsep ,rootDirectory} = props
  const ROOTDIR = rootDirectory;

  // const reader = new FileReader();
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    let newUploadProgressData = [];
    for (var i in acceptedFiles){
      if (uploadProgressData !== null) newUploadProgressData[i] = uploadProgressData[i];
      else newUploadProgressData[i] = 0;
    }        
    const typeCheck = isAllowedToUpload(acceptedFiles,rootDirectory)    
    if(typeCheck)
    {
      setUploadProgressData(newUploadProgressData);
      setFiles(acceptedFiles)
    }else{
      console.log('>>>>>>>>>>>>>>wrong type')
      setFiles(null)
    }
    // reader.readAsDataURL(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  
  // const [file, setFile] = useState();

  const [ files, setFiles] = useState(null);
  const [ fileListCssClass, setFileListCssClass ] = useState("")
  const [ uploadProgressData, setUploadProgressData ] = useState(null)
  const [ isMultiUploading, setIsMultiUploading ] = useState(false);
  const [ uploadedFileIndex, setUploadedFileIndex ] = useState(null);

  useEffect(() => {
    if (files !== null){
      const fileUploaderHeight = document.getElementById('file-uploader').offsetHeight;
      // console.log((files.length + 1 * 37),fileUploaderHeight)
      if (fileUploaderHeight < ((files.length + 1) * 37)) setFileListCssClass(' w-scroll')
      else setFileListCssClass('')
    }
  },[files])

  useEffect(() => {
    if (isMultiUploading === true){
      setUploadedFileIndex(0);
    }
  },[isMultiUploading])

  useEffect(() => {
    if (uploadedFileIndex !== null){
      uploadFile(uploadedFileIndex,true)
    }
  },[uploadedFileIndex])

  const renameFile = (index) => {
    // console.log(files[index], "rename this file")
  }

  const removeFile = (index) => {
    const newFiles = [
      ...files.slice(0,index),
      ...files.slice(index + 1,files.length)
    ]
   setFiles(newFiles)
  }

  const uploadFile = (index,multiple = false) => {

    let folderPath = "/";
    if (selectedFolder !== null){
      folderPath = selectedFolder.slice(-1) === "/" ? selectedFolder : selectedFolder + "/";
    }

    // const filePath = (ROOTDIR.startsWith('/home/pi')?ROOTDIR.substring(9):ROOTDIR)
    //                 +folderPath + files[index].path.split(files[index].name)[0];
    const filePath = ROOTDIR + folderPath;

    // console.log('>>>>>>>>>>>>>>>>>>>uploadFile');
    // console.log(selectedFolder)
    // console.log(files)
    // console.log(filePath,"filePath")
    const url = `http://${window.location.hostname}:3000/upload/${filePath.split(fsep).join('+++')}`
    const formData = new FormData();
    formData.append('file', files[index])  
    // console.log('>>>>>>>>>>>>>>>>file:',files[index])
    const config = {
      onUploadProgress: progressEvent => {
        const newUploadProgressData = [
          ...uploadProgressData.slice(0,index),
          progressEvent.loaded,
          ...uploadProgressData.slice(index + 1, uploadProgressData.length)
        ]
        setUploadProgressData(newUploadProgressData)
      }
    }

    axios.post(url, formData, config ).then(res => {
      // console.log(res);
      if (multiple === true){
        if (index + 1 < files.length){
          setUploadedFileIndex(index + 1)
        } else {
          props.setShowFileUploader(false)
          props.refreshFileManager(res.data)
        }
      }
    });

  }

  const uploadFiles = async () => {
    setIsMultiUploading(true)
  };

  let fileListDisplay, dropZoneDisplay;

  if (files && files.length > 0){
    
    const filesList = files.map((f,index) => (
      <FileUploaderListItem
        key={index}
        index={index}
        file={f}
        uploadProgress={uploadProgressData[index]}
        renameFile={renameFile}
        removeFile={removeFile}
        uploadFile={uploadFile}
      />
    ))

    fileListDisplay = (
      <div id="file-uploader-summary-list">
          <div id="file-list" className={fileListCssClass}>
            {filesList}
          </div>
        <div id="file-list-actions">
          <div style={{float:"right"}}>

            <div className='upload-items-counter'>
                {uploadedFileIndex !== null ? uploadedFileIndex + " / " + files.length + " Total" : ""}
            </div>

            <a className='button' onClick={() => props.setShowFileUploader(false)}>Close</a>
            <a className='button' onClick={uploadFiles}> Upload Files </a>
          </div>
        </div>
      </div>
    )

  } else {

    const dir = DIRECTORIES.filter(d=>d.rootDirectory==rootDirectory).pop();    
    dropZoneDisplay = (
      <div className="dropzone-container" {...getRootProps()}>
        <input {...getInputProps()} name="file" />
        {isDragActive ? <p>Drop the files{dir.allowedUploadTypes?'['+dir.allowedUploadTypes+']':''} here ...</p> : <p>Drag 'n' drop some files {dir.allowedUploadTypes?'['+dir.allowedUploadTypes+']':''} here, or click to select files</p>}
      </div>
    )

  }

  return (
    <React.Fragment>
    <div id="file-uploader">

            <a className='close-file-uploader' onClick={() => props.setShowFileUploader(false)}>
                <FaWindowClose/>
            </a>

      {dropZoneDisplay}
      {fileListDisplay}
    </div>
    </React.Fragment>
  );
}

const FileUploaderListItem = (props) => {
  
  const { file, index, uploadProgress } = props;

  let percent = uploadProgress;
  if (uploadProgress > 0) percent = parseInt( (100 * uploadProgress) / file.size)

  return (
    <div className='file-uploader-list-item'>
      <div className='list-item-file-info'>
        <span className='file-name'>{file.path}</span>
        <span className='file-size'>{humanFileSize(file.size)}</span>
      </div>
      <div className='list-item-progress-container'>
        <div className='list-item-progress-bar' style={{width:percent+"%"}}>
          <span>{humanFileSize(uploadProgress)}</span>
        </div>
      </div>
      <div className='list-item-actions'>
        <a className='button' onClick={() => props.renameFile(index)}><BiRename/></a>
        <a className='button' onClick={() => props.uploadFile(index)}><ImUpload/></a>
        <a className='button' onClick={() => props.removeFile(index)}><RiDeleteBin6Fill/></a>
      </div>    
    </div>
  )
}

export default FileUploader;
