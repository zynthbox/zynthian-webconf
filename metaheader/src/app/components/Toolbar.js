import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import DropTargetZone from "./DropTargetZone";
import Sktechpad from "./Sktechpad";
import { updateSketchpadInfo } from '../../../store/sampleEditor/sampleEditorSlice';
import { useDispatch, useSelector } from "react-redux";
import "react-resizable/css/styles.css";
const Toolbar = () => {
    const dispatch = useDispatch()
    const [showPanel, setShowPanel] = useState(false);
    const [size, setSize] = useState({ width: 1000, height: 500 });
    const [position, setPosition] = useState({ x: 0, y: 0 });  
    const [ files, setFiles] = useState([]);
   
    
    let dropedFilesDisplay;  
    if(files){
      dropedFilesDisplay = <ul>
                      {files.map((f,index)=>(<li key={index}>                      
                          {f} 
                          </li>))}
                  </ul>
    }

    useEffect(() => {
      setPosition({
        x: 10,
        y: window.innerHeight / 2 - size.height / 2,
      });
    }, [size]);

    const togglePanel = () => {
      setShowPanel(!showPanel);
    };
  
    const handleDrop = (item) => {
      console.log(`Item  dropped!`,item);
    
      setFiles((prevFiles) => ['['+prevFiles.length+']'+item.id,...prevFiles]);       
      if(item.type=='SKETCHPAD')
      {          
        const filePath = item.id; 
        const fileName = filePath.split('/')[filePath.split('/').length - 1].split('.sketchpad.json')[0]            
        console.log(filePath);
        dispatch(updateSketchpadInfo({filePath:filePath,fileName:fileName}))
      }
    };

    return (
      <div style={styles.toolbar} >
        <button onClick={togglePanel} style={styles.button}>
          Current Sketchpad
        </button>
     
        {ReactDOM.createPortal(
        showPanel && (
          <Draggable handle=".window-header" defaultPosition={position}>
            <div className="window-container" style={{ width: size.width, height: size.height }}>
              <ResizableBox
                width={size.width}
                height={size.height}
                minConstraints={[200, 150]}
                maxConstraints={[1000, 800]}
                onResizeStop={(e, { size }) => setSize(size)}
                className="window-panel"
              >
                <div className="window">
                  <div className="window-header">
                    <span>Current Sketchpad</span>
                    <button onClick={() =>  setShowPanel(false)}>×</button>
                  </div>
                  <div className="window-content">                                                           
                    {/* <div className="tw:flex">
                      <DropTargetZone onDrop={handleDrop}>
                        Drag stuff here
                      </DropTargetZone>    
                      <div style={styles.displayContainer}>
                      {dropedFilesDisplay}
                    </div>
                  </div>                                         */}
                  <Sktechpad></Sktechpad>
                  </div>
                  
                  

                 
                 
                </div>
              </ResizableBox>
            </div>
          </Draggable>
        ),
        document.body
      )}
      </div>
    );
  };
  
  const styles = {
    toolbar: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40px',
      backgroundColor: '#333',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      zIndex: 1000,
    },
    button: {
      backgroundColor: '#555',
      color: '#fff',
      border: 'none',
      padding: '10px 20px',
      cursor: 'pointer',
    },
    displayContainer:{
      height:'200px',
      overflow:'auto',
    }
  };
  
export default Toolbar