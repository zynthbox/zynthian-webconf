import React, { useCallback,useState, useRef,useEffect } from 'react';
import {ChiptuneJsPlayer} from 'chiptune3';
import {useDropzone} from 'react-dropzone'
const TrackerPlayer =()=>{
    const [isPlaying, setIsPlaying] = useState(false);
    const [meta, setMeta] = useState('');
    const playerRef = useRef(null); 
    const [ files, setFiles] = useState(null);
    useEffect(() => {
      if (files !== null){ handleFileChange()}
     },[files])
     
    useEffect(() => {              
        playerRef.current = new ChiptuneJsPlayer()
        playerRef.current.onInitialized(() => {
         // callback after init    
      })           
    }, []); // Run only once when the component mounts

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
          playerRef.current.play(arrayBuffer);          
        };
        reader.readAsArrayBuffer(files[0]);        
        playerRef.current.onMetadata((meta) => {    
          console.log(meta.song);
          meta.song = 'too large to display this way...'
          setMeta(JSON.stringify(meta).replace(/,/g,'<br/>&nbsp;&nbsp;'))
        })
        setIsPlaying(true);
    }
    
    const onDrop = useCallback(acceptedFiles => {          
      setFiles(acceptedFiles);
    }, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
    
  return (
          <div>                 
             <div className="dropzone-container" {...getRootProps()} >
                <input {...getInputProps()} name="file" />
                {isDragActive ? <p>Drop a file[it, xm, s3m, mod, umx, mptm] here ...</p> : <p>Drag 'n' drop a file[it, xm, s3m, mod, umx, mptm] here, or click to select file</p>}
            </div>                         
            <div>
              {files &&
              <button onClick={togglePause}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              }
            </div>

            { meta &&            
            <div dangerouslySetInnerHTML={{ __html: meta }}></div>
            }
          </div> 
  )

}

export default TrackerPlayer;
