import React, { useState,useContext,useEffect } from 'react'
import { Context } from './file-explore/context/context-provider';
const SketchpadEditor =()=> {
    const { fileManagerState, fileManagerDispatch } = useContext(Context);
    const [sketchpadinfo, setSketchpadinfo] = useState(null);

    useEffect(() => {
            showSketchpadInfo();
    },[fileManagerState.files])

    const showSketchpadInfo = ()=>{
      
        const file = fileManagerState.files[0]
        if (file && !file.isDir) 
        {
          if (file.path.indexOf('.') > -1){
            const fileType = file.path.split('.')[file.path.split('.').length - 1];
            if (fileType === "json"){
              setSketchpadinfo(file.name);
            }
          }
        }
    }
    return (
      <div>{sketchpadinfo}</div>
    )
  
}

export default  SketchpadEditor;