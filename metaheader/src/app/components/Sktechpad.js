import React, { useEffect, useRef } from 'react'
import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getSketchpad, getSketchpadInfo, saveSketchpad, updateSketchpadInfo } from '../../../store/sampleEditor/sampleEditorSlice';
import DropTargetField from './DropTargetField';
import { FaSync } from "react-icons/fa";
import { io } from "socket.io-client";

function TruncatedText(text, maxLength = 20) {
    const truncated = text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    return <span title={text}>{truncated}</span>;
  }

// function getSketchpadCommand(str) {
//     const regex = /\{.*?\}/s; // Match a JSON-like object inside `{}` (single JSON object)
//     const match = str.match(regex); // Find JSON pattern
//     if (match) {
//         try {
//             const jsonObject = JSON.parse(match[0]); // Convert JSON string to object
//             // { "messageType": "success", "category": "sketchpad", "command": "save" }            
//                 if(jsonObject.category == 'sketchpad' && 
//                         jsonObject.command == 'save'                        
//                     ){
//                         return jsonObject;
//                     }else{
//                         return false;
//                     }                            
//         } catch (error) {
//             return false;
//         }
//     }
//     return false;
// }

function getCommandCallback(str,command) {
    const regex = /\{.*?\}/s; // Match a JSON-like object inside `{}` (single JSON object)
    const match = str.match(regex); // Find JSON pattern
    if (match && command) {
        try {
            const jsonObject = JSON.parse(match[0]); // Convert JSON string to object
            // { "messageType": "success", "category": "sketchpad", "command": "save" }            
                if(jsonObject.category == command.category && 
                        jsonObject.command == command.command                        
                    ){
                        return jsonObject;
                    }else{
                        return false;
                    }                            
        } catch (error) {
            return false;
        }
    }
    return false;
}

const socket = io(`${window.location.protocol}//${window.location.hostname}:3000`);
// console.log('>>>>>>>>>>>create socket:',`${window.location.protocol}//${window.location.hostname}:3000`);
// console.log('>>>>>>>>>>>create socket:',socket);
function Sktechpad() {
    const { sketchpadInfo, sketchpad, pendingFiles } = useSelector((state) => state.sampleEditor);
    const dispatch = useDispatch()
    const [activeTrack, setActiveTrack] = useState(1);
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);
    const [currentCommand,setCurrentCommand] = useState(null);
    const currentCommandRef = useRef(currentCommand);
    const [message,setMessage] = useState('');
    const tracker = [1,2,3,4,5,6,7,8,9,10];

    useEffect(() => {
        currentCommandRef.current = currentCommand;
    }, [currentCommand]);

    // socket pull msg later with click...
    useEffect(() => {                
        // Listen for messages from the server

            // socket wait for two msg. first command execution. secondly sketchpad save success then stop loading do reload page
            socket.on("fifoChanged", (msg) => {                        
                // setMessage(msg);   
                setMessage(prev => prev + '\n' + msg);      
                const current = currentCommandRef.current; // <== get the latest value                     
                if(current.messageType == undefined){ // first test if command succeed
                    let callback = getCommandCallback(msg,current)
                    if(callback && callback.messageType !== undefined){
                        setCurrentCommand(callback);                       
                    }    
                }else{                  
                    if(current.messageType!='success'){
                        // stop loading command failed
                        setLoading(false)
                        // setMessage('Failed. please try again later');
                        setMessage(prev => prev + '\n' + 'Failed. please try again later');  
                    }else{
                        // secondly check if sketchpad saved succeed
                        let callback = getCommandCallback(msg,{"category": "sketchpad", "command": "save" })                        
                        if(callback && callback.messageType == 'success'){                            
                            setLoading(false)
                            setMessage(prev => prev + '\n done');     
                            dispatch(getSketchpadInfo());
                        }
                    } 
                }
            });                            
           
        return ()=>{
            socket.off("fifoChanged")
        }
      },[])


    useEffect(() => {
        dispatch(getSketchpadInfo())
    },[])

    useEffect(() => {
        dispatch(getSketchpadInfo())
    },[reload])

    useEffect(() => {
        if (sketchpadInfo !== null){
            dispatch(getSketchpad())
        }
    },[sketchpadInfo])

    async function handleDrop(item, accept,extraInfo) {        
        console.log(`Item  dropped`,item, extraInfo);
        console.log('accept:',accept)        
        if(item.type !== accept)
        {
            setMessage('Please drop a '+accept);            
            return;
        }
        let command;
        setLoading(true);
        if(item.type=='SKETCHPAD'){   
            // const filePath = item.id; 
            // const fileName = filePath.split('/')[filePath.split('/').length - 1].split('.sketchpad.json')[0]                        
            // dispatch(updateSketchpadInfo({filePath:filePath,fileName:fileName}))            
            command = { "category": "sketchpad", "command": "load", "params": [item.id] }     
            setCurrentCommand(command);
        }
        if(item.type=='SOUND'){                       
            command = { "category": "track", "command": "loadSound", "trackIndex": extraInfo, "params": [item.id] }                                
            setCurrentCommand(command);
        } 
        if(item.type=='SAMPLE'){                                   
            command = { "category": "track", "command": "loadIntoSlot", "trackIndex": (extraInfo.track-1),"slotType":'sample',"slotIndex":extraInfo.slot, "params": [item.id] }                                            
            setCurrentCommand(command);
        }         
         // here write to fifo        
        const response = await fetch(`http://${window.location.hostname}:3000/writeToFIFO`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({msg:JSON.stringify(command)})
            });        
        
      };

    let track = null, samples = null, synths=null, fxs=null,mode=null;
    if(sketchpad){
        track = sketchpad.tracks[activeTrack-1]
        if(track.trackType === "sample-trig" || track.trackType === "synth"){          
            samples = track.sampleSlotsData	;
            synths = track.synthSlotsData;
            fxs = track.fxSlotsData;	
            mode = 'Synth'
        }else if(track.trackType === "sample-loop"){            
            // samples = track.clips.map(c=>c[0]);            
            samples = track.sketchSlotsData
            mode = 'Sketch'
        }else{
            mode = 'External'
            samples = track.externalSlotsData
        }
    }

  return (
                <div className="tw:w-full tw:mx-auto tw:p-4">                    
                    <button className="tw:px-4 tw:py-2 tw:rounded-lg tw:inline-block" onClick={() => setReload(!reload)}>
                        <FaSync className={loading?'tw:animate-spin tw:text-[#0078d7]':''}/>
                    </button>
                    <span className='tw:text-[#0078d7]'>{message}</span>
                    <span className='tw:text-red-300 tw:flex'>{JSON.stringify(currentCommand)}</span>
                    {sketchpadInfo && 
                       
                         <DropTargetField onDrop={handleDrop} accept='SKETCHPAD' width={600} height={50}>
                         Sketchpad :  {sketchpadInfo.lastSelectedSketchpad.split('/zynthian/zynthian-my-data/sketchpads/my-sketchpads/')[1]} 
                        </DropTargetField>                        
                       
                    }
                    <div className="tw:flex tw:border-b tw:border-gray-300">
                      {tracker.map((t,index)=>(
                        <button 
                        key={index}
                        onClick={() => setActiveTrack(t)} 
                        className={`tw:flex-1 tw:text-center tw:py-2 tw:text-sm tw:font-medium tw:border-b-4 tw:transition-all ${activeTrack === t ? "tw:border-blue-500 tw:text-blue-500" : "tw:border-transparent tw:text-gray-500 hover:tw:text-gray-700"}`}
                      >
                         <DropTargetField onDrop={handleDrop} accept='SOUND' extraInfo={index}>
                            Track{t}
                        </DropTargetField>
                      </button>
                      ))}                                         
                    </div>
                    <div className="tw:p-4 tw:bg-white tw:rounded-lg tw:shadow-md tw:mt-4">                        
                         <div className="tw:container tw:mx-auto tw:p-4">     
                         {track && 
                         <h3>{mode}</h3>
                         }
                         {track && track.trackType=='external' &&
                            <h3> external mode</h3>
                         }  

                        {(track && (track.trackType=='synth' || track.trackType=='sample-trig')) &&
                            <>                                                              
                            <div className="tw:grid tw:grid-cols-12 tw:gap-4">
                                <div className="tw:col-span-2">Synths:</div>
                                {
                                    synths && synths.map((s,index)=>(
                                                <div key={index} className="tw:col-span-2 tw:border-b-[1px] tw:border-gray-300">
                                                    {s && TruncatedText(s,10)}
                                                </div>
                                            )                                        
                                        )
                                }                                                         
                            
                                <div className="tw:col-span-2">Samples:</div>
                                {                                                     
                                    samples && samples.map((s,index)=>{
                                            const extraInfo = {track:activeTrack, type:'sample',slot:index}                                            
                                            return (                                           
                                                <div key={index} className="tw:col-span-2 tw:border-b-[1px] tw:border-gray-300">                                                   
                                                    <DropTargetField onDrop={handleDrop} accept='SAMPLE' extraInfo={extraInfo} width={150}>
                                                    {s && TruncatedText(s,10)}
                                                    </DropTargetField>
                                                </div>
                                            )
                                        }                                        
                                        )
                                }                                               
                         
                                <div className="tw:col-span-2">Fx:</div>
                                {
                                    fxs && fxs.map((s,index)=>(
                                                <div key={index} className="tw:col-span-2 tw:border-b-[1px] tw:border-gray-300">
                                                    {s && TruncatedText(s,10)}
                                                </div>
                                            )                                        
                                        )
                                }                            
                            </div>
                            </>
                        }

                        {(track && track.trackType=='sample-loop') &&
                            <div className="tw:grid tw:grid-cols-12 tw:gap-4">
                            <div className="tw:col-span-2">Sketches:</div>
                            <div className="tw:col-span-2 tw:border-b-[1px] tw:border-gray-300">1</div>
                            <div className="tw:col-span-2 tw:border-b-[1px] tw:border-gray-300">2</div>
                            <div className="tw:col-span-2 tw:border-b-[1px] tw:border-gray-300">3</div>
                            <div className="tw:col-span-2 tw:border-b-[1px] tw:border-gray-300">4</div>
                            <div className="tw:col-span-2 tw:border-b-[1px] tw:border-gray-300">5</div>                            
                            </div>
                        }
                        </div>

                    </div>
                </div>
  )
}

export default Sktechpad