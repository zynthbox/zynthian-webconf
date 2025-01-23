import React, {useCallback,useState} from 'react'
import {useDropzone} from 'react-dropzone'
import axios from 'axios';
const TrackerModule =()=>{
    const [ files, setFiles] = useState(null);
    const [ fileInfo, setFileInfo] = useState(null);
    const [ samples, setSamples] = useState(null);
    const [ path, setPath] = useState(null)
    const [ uploadProgressData, setUploadProgressData ] = useState(null)
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    let newUploadProgressData = [];
    for (var i in acceptedFiles){
      if (uploadProgressData !== null) newUploadProgressData[i] = uploadProgressData[i];
      else newUploadProgressData[i] = 0;
    }

    setUploadProgressData(newUploadProgressData);
    setFiles(acceptedFiles);

  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  
  const handlePlaySample =(s)=>{
      const samplePath = '/home/pi/zynthian-my-data/tmp/webconf/tracker/uploads/'+path+'/'+s;       
      const url = `http://${window.location.hostname}:3000/play-sample/${path+'+++'+s}`
      axios.get(url).then(res => { 

      })
  }
  const handleExtractSamples =()=>{
      const url = `http://${window.location.hostname}:3000/tracker-info/${files[0].name}`
      const formData = new FormData();        
      formData.append('file', files[0])  
      const config = {
          // onUploadProgress: progressEvent => {
          //   const newUploadProgressData = [
          //     ...uploadProgressData.slice(0,index),
          //     progressEvent.loaded,
          //     ...uploadProgressData.slice(index + 1, uploadProgressData.length)
          //   ]
          //   setUploadProgressData(newUploadProgressData)
          // }
        }
    
        axios.post(url, formData, config ).then(res => { 
        setFileInfo(res.data.message);   
        setSamples(res.data.samples);
        setPath(res.data.path);

        });   
  }
  
  let samplesDisplay =null;
  if(samples){
    samplesDisplay = <ul className='sample-list'>
      {samples.map((s,i)=> <li key={i}> 
         <a onClick={()=>{handlePlaySample(s)}}>{s} </a>
         </li>)}
    </ul>
  }

  return (
    <div className='module-container'>
      <div className="dropzone-container" {...getRootProps()} >
          <input {...getInputProps()} name="file" />
          {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
      </div>      
      {files &&      
      <button onClick={handleExtractSamples}>{ files[0].name} {'>>>>>>>'} extract samples</button>
      }
      <ul className='file-info'>{fileInfo}</ul>
      <div className='sample-container'>          
           
           {samplesDisplay}
      </div>
    </div>
  )
}
export default TrackerModule