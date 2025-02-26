import React, {useCallback,useEffect,useState,useRef} from 'react'
import {useDropzone} from 'react-dropzone'
import axios from 'axios';
// import {ChiptuneJsPlayer} from 'chiptune3';
import {ChiptuneJsPlayer} from './chiptune/chiptune3.js';

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
            setMeta(JSON.stringify(meta).replace(/,/g,'<br/>&nbsp;&nbsp;'))
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
            <div className='metadata' dangerouslySetInnerHTML={{ __html: meta }}></div>
            }

      <ul className='file-info'>{fileInfo}</ul>
      <div className='sample-container'>                     
           {samplesDisplay}
      </div>
     
      
    </div>
  )
}
export default TrackerModule