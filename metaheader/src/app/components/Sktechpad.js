import React, { useEffect } from 'react'
import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { getSketchpad, getSketchpadInfo, saveSketchpad, updateSketchpadInfo } from '../../../store/sampleEditor/sampleEditorSlice';
import DropTargetField from './DropTargetField';
import { FaSync } from "react-icons/fa";
function TruncatedText(text, maxLength = 20) {
    const truncated = text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    return <span title={text}>{truncated}</span>;
  }

function Sktechpad() {
    const { sketchpadInfo, sketchpad, pendingFiles } = useSelector((state) => state.sampleEditor);
    const dispatch = useDispatch()
    const [activeTrack, setActiveTrack] = useState(1);
    const [reload, setReload] = useState(false);
    const tracker = [1,2,3,4,5,6,7,8,9,10];

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

    async function handleDrop(item, extraInfo) {
        console.log(`Item  dropped`,item, extraInfo);
        
        let command;
        if(item.type=='SKETCHPAD'){   
            // const filePath = item.id; 
            // const fileName = filePath.split('/')[filePath.split('/').length - 1].split('.sketchpad.json')[0]                        
            // dispatch(updateSketchpadInfo({filePath:filePath,fileName:fileName}))            
            command = { "category": "sketchpad", "command": "load", "params": [item.id] }     
        }
        if(item.type=='SOUND'){                       
            command = { "category": "track", "command": "loadSound", "trackIndex": extraInfo, "params": [item.id] }                                
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
                    <button className="tw:px-4 tw:py-2 tw:rounded-lg tw:inline-block" onClick={() => setReload(!reload)}><FaSync /></button>
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
                                                    <DropTargetField onDrop={handleDrop} accept='FILE' extraInfo={extraInfo}>
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