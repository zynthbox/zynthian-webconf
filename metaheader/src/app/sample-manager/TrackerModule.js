import React, {useCallback,useEffect,useState,useRef} from 'react'
import {useDropzone} from 'react-dropzone'
import axios from 'axios';
import {ChiptuneJsPlayer} from './chiptune/chiptune3.js';
function formatBytes(a,b=2){if(!+a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return`${parseFloat((a/Math.pow(1024,d)).toFixed(c))} ${["Bytes","KiB","MiB","GiB","TiB","PiB","EiB","ZiB","YiB"][d]}`}
function formatDuration(seconds) {
  const roundedSeconds = Math.round(seconds);
    const m = Math.floor(roundedSeconds / 60).toString().padStart(2, '0');
    const s = (roundedSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}
const TrackerModule =()=>{

    const [ files, setFiles] = useState(null);
    const [ fileInfo, setFileInfo] = useState(null);
    const [ samples, setSamples] = useState(null);
    const [ path, setPath] = useState(null)

    const [isPlaying, setIsPlaying] = useState(false);
    const [meta, setMeta] = useState('');
    const playerRef = useRef(null); 


   useEffect(() => {
      if (files !== null){         
        handleFileChange()        
      }
     },[files])
   
     const togglePause = ()=>{
      playerRef.current.togglePause()
      setIsPlaying(isPlaying ? false : true);
    }
   
    const handleFileChange =(event)=>{          
        
        // const file = event.target.files[0];    
                       
        const reader = new FileReader();          
        reader.onload = function(e) {
          // This is where you get the ArrayBuffer
          const arrayBuffer = e.target.result;              
          if(playerRef==null || playerRef.current==null){
              playerRef.current = new ChiptuneJsPlayer();
              playerRef.current.onInitialized(() => {               
                playerRef.current.play(arrayBuffer);        
              })           
          }else{
            playerRef.current.play(arrayBuffer);             
          }
         
          playerRef.current.onMetadata((meta) => {    
            console.log('>>>>>>>>>>>>>>>>meta:',meta);
                  
            meta.song = 'too large to display this way...'
            // setMeta(JSON.stringify(meta).replace(/,/g,'<br/>&nbsp;&nbsp;'))
            meta.name=files[0].name;
            meta.size = files[0].size;
            meta.type = files[0].type;
            setMeta(meta)
          })
          setIsPlaying(true);                   
        };
        reader.readAsArrayBuffer(files[0]);    
    }
    
    const onDrop = useCallback(acceptedFiles => {          
      setFiles(acceptedFiles);
    }, [])
    
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})



    const handlePlaySample =(s)=>{          
        const url = `http://${window.location.hostname}:3000/play-sample/${path+'+++'+s}`
        axios.get(url).then(res => { 
        })
    }

  const handleExtractSamples =()=>{
      const url = `http://${window.location.hostname}:3000/tracker-info/${files[0].name}`
      const formData = new FormData();        
      formData.append('file', files[0])  
      const config = {        
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
                {isDragActive ? <p>Drop a file[it, xm, s3m, mod, umx, mptm] here ...</p> : <p>Drag 'n' drop a file[it, xm, s3m, mod, umx, mptm] here, or click to select file</p>}
            </div>                         
            <div>
              {files &&
              <>
              <button onClick={togglePause}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={handleExtractSamples}> Extract Samples </button>
              </>
              }
      </div>
      
      { meta &&            
            <div className='metadata'>
              <ul>
                <li>Name: {meta.name}</li>
                <li>Title: {meta.title}</li>
                <li>Size: {formatBytes(meta.size)}</li>
                <li>Type: {meta.type} [{meta.type_long}]</li>
                <li>Tracker: {meta.tracker} </li>
                <li>Orders: {meta.totalOrders} </li>
                <li>Patterns: {meta.totalPatterns} </li>
                <li>Duration: {formatDuration(meta.dur)} </li>
              </ul>
               
            </div>
            }

      <ul className='file-info'>{fileInfo}</ul>
      <div className='sample-container'>                     
           {samplesDisplay}
      </div>
     
      
    </div>
  )
}
export default TrackerModule