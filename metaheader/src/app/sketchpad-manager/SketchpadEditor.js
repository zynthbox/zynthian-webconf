import React, { useEffect,useRef,useState,lazy, Suspense } from 'react'
import { useDispatch, useSelector } from "react-redux";
import WavePlayer from '../components/WavePlayer';
import { BsFillFolderFill, BsViewList } from "react-icons/bs";
import { GoVersions } from "react-icons/go";
import { HiCollection } from "react-icons/hi";

import { GiMagnifyingGlass } from "react-icons/gi";
import {getFolders,
  getSketchpad,
  getSketchpadVersions,
  setFolder,
  setSketchpad,
  setVersion,  
  setSamples,
  setTracks,
  setSongs,
  setPatterns,
  getPatterns,  
  getSounds,
  setItemGroupsReady,
  setItemGroup,
  setItem,
  setSketches
}  from  '../../../store/sketchpad-manager/SketchpadMangerSlice'; 
import DraggableItem from '../components/DraggableItem';

const SketchpadEditor =(props)=> {
  const { colorsArray } = props;
  const [ urlToPlay, setUrlToPlay] = useState(null);
  const [ detail, setDetail] = useState(null);
  const dispatch = useDispatch();    
  
 
  const {
    status,
    error,
    statusItem,
    folders,
    folder,
    versions,
    version,
    sketchpad,  
    itemGroups,
    itemGroupTypes,
    itemGroup,
    item
       } = useSelector((state) => state.sketchpadmanager);
 
  // useEffect(() => {      
  //     dispatch(getFolders())
  // },[])

  useEffect(() => {
    if (folder !== null) dispatch(getSketchpadVersions(folder));      
    setUrlToPlay(null);     
    setDetail(null)  
  }, [folder]);

  useEffect(() => {      
    setUrlToPlay(null); 
    setDetail(null);    
    dispatch(setSketchpad(null));          
  },[versions])
  

  useEffect(() => {   
    if (version !== null) dispatch(getSketchpad(version));
    setUrlToPlay(null); 
    setDetail(null)          
  }, [version]);
  
  useEffect(() => {
   if(sketchpad) handleSceneSelection();
   setUrlToPlay(null);   
   setDetail(null)      
  }, [sketchpad]);

  useEffect(() => {
    if (itemGroups !== null){
      let isReady = true;
      itemGroupTypes.forEach(function(igt,index){
        if (itemGroups[igt] === null) isReady = false
      })
      if (isReady){
        dispatch(setItemGroupsReady())
      }
    }
  },[itemGroups])

  useEffect(() => {  
    setUrlToPlay(null);       
    setDetail(null)  
   }, [itemGroup]);
  
     
  const playSample =(path,track)=>{    
    let dir = version.split('/home/pi/')[1].split('/');
    dir.pop();
    const urlToPlay = `http://${window.location.hostname}:3000/${dir.join('/')}/wav/sampleset/sample-bank.${track +1}/${path}`    
    if(urlToPlay){     
      setUrlToPlay(urlToPlay);            
    }   
  }
       
  const playSketch =(path,track)=>{    
    let dir = version.split('/home/pi/')[1].split('/');
    dir.pop();
    const urlToPlay = `http://${window.location.hostname}:3000/${dir.join('/')}/wav/${path}`    
    if(urlToPlay){     
      setUrlToPlay(urlToPlay);            
    }   
  }

  let detailDisplay;
  if(urlToPlay){           
    detailDisplay =  <WavePlayer audioUrl={urlToPlay} />    
  }else if(detail){
    
    detailDisplay = <ul className='detail'>      
      <li><a>Default Note Duration: {detail.defaultNoteDuration}</a></li>
      <li><a>Pattern Length: {detail.patternLength}</a></li>
      <li><a>Swing: {detail.swing}</a></li>
      <li><a>Scale: {detail.scale}</a></li>
      <li><a>Octave: {detail.octave}</a></li>
      <li><a>Pitch: {detail.pitch}</a></li>
      <li><a>Step Length: {detail.stepLength}</a></li>
      <li><a>Active Bar: {detail.activeBar}</a></li>                    
      <li><a>Bank Length: {detail.bankLength}</a></li>
      <li><a>Enabled: {detail.enabled === true ? "true" : "false"}</a></li>
      <li><a>Start Note: {detail.gridModelStartNote}</a></li>
      <li><a>End Note: {detail.gridModelEndNote}</a></li>
      <li><a>Midi Channel: {detail.midiChannel}</a></li>                  
                </ul>
  }

  

  function handleSceneSelection() {
    setUrlToPlay(null);       
    // Samples 
    let newSamples = [];
    sketchpad.tracks.forEach(function (channel, index) {
      channel.samples.forEach(function (s, pIndex) {
         if(s){
          const sample = {...s}
          sample.track = index
          sample.slot = pIndex
          sample.trackType = channel.trackType
          newSamples.push(sample)
         }       
      });
    });   
    
    // Sketches
    let sketches =[];
    sketchpad.tracks.forEach(function (channel, index) {      
      channel.clips.forEach(function (s, pIndex) {        
         if(s[0].path){
          const sketch = {...s[0]}
          sketch.track = index
          sketch.slot = pIndex
          sketch.trackType = channel.trackType
          sketches.push(sketch)
         }       
      });
    }); 
    
    dispatch(setSamples(newSamples))
    dispatch(setSketches(sketches))
    dispatch(setTracks([]))
    dispatch(setSongs([]))
    dispatch(getPatterns())   
    dispatch(getSounds(version))
  }
  
 
  let itemDisplay;
  if(itemGroup && version){
    const items = itemGroups[itemGroup];
    let dir = version.split('/home/pi/')[1].split('/');
    dir.pop();    
    if(itemGroup=='samples'){              
        itemDisplay = <ul>
          {items.map((item,index)=>(                     
          <li key={index}> 
            
            <a onClick={()=>playSample(item.path,item.track)}>
            <DraggableItem 
                  id={`${itemGroup}_${dir.join('/')}/wav/sampleset/sample-bank.${item.track +1}/${item.path}` } 
                  type='SAMPLE'
                  extraInfo={{track:item.track,slot:item.slot}}
                  > <span>{item.path}</span>          
            <small>Track: {item.track + 1} | Slot: {item.slot + 1}</small>   
            </DraggableItem>        
            </a>
           
            </li>
            ))}
        </ul>

    }else if(itemGroup=='sounds'){     
        itemDisplay = <ul>
        {items.map((item,index)=>(<li key={index}> <a>
          <DraggableItem id={`${itemGroup}_${item.preset_name}` } 
                                       type='SOUND'>  
          <span>{item.preset_name}</span>
          <small>{item.engine_name}</small>
          </DraggableItem> 
          </a> </li>))}
          </ul>
    }else if(itemGroup=='sketches'){     
      itemDisplay = <ul>
                      {items.map((item,index)=>(                      
                        <li key={index}>                        
                        <a onClick={()=>playSketch(item.path,item.track)}>    
                        <DraggableItem id={`${itemGroup}_${dir.join('/')}/wav/${item.path}` } 
                                       type='SKETCH'>                       
                        <span>{item.path}</span>
                        <small>Track: {item.track + 1} | Slot: {item.slot + 1}</small>    
                        </DraggableItem>                    
                        </a> 
                        
                        </li>))}
                   </ul>
    }else if(itemGroup=='patterns'){     
      itemDisplay = <ul>
                      {items.map(item=>(<li key={item.name}> <a onClick={()=>setDetail(item)}> 
                      <DraggableItem id={`${itemGroup}_${item.name}` } 
                                       type='PATTERN'>                         
                        <span>{item.name}</span>
                        <span className='right'>Bars: <b>{item.bankLength}</b></span>      
                        </DraggableItem>           
                        </a> </li>))}
                   </ul>
    }else{
      itemDisplay = <ul><li>{JSON.stringify(items)}</li></ul>      
    }
  }
 
  
    return (
      <div id="sketch-pad-xtractor">        
      <div className="sketch-pad-xtractor-row">
        {/* <div
          className="sketch-pad-xtractor-column"  
          style={{ backgroundColor: colorsArray[0] }}       
        >
          <h4>
            <BsFillFolderFill />
             Sketchpads
          </h4>
          <div className='xtractor-column-container'>
            <ul>
            {folders.map(f=>(               
               <li id={f.path} 
                onClick={()=> dispatch(setFolder(f.path))}>
                <a className={f.path === folder ? "active" : ""} >{f.name}</a>
                </li>                                
            ))}
            </ul>
          </div>
        </div> */}

        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[1] }}
          
        >
          <h4>
            <GoVersions />
            Versions
          </h4>
          <div className='xtractor-column-container' >
          <ul>
            {versions && versions.map(f=>{
              const fileName = f.path.split('/')[f.path.split('/').length - 1];
              const folderName = f.path.split(fileName)[0];
               return (<li id={f.path} onClick={()=> dispatch(setVersion(f.path))}>
                        <a className={f.path === version ? "active" : ""}>
                        <DraggableItem id={`SKETCHPAD_${f.path}`} type='SKETCHPAD'> 
                          <span>{fileName}</span>
                        </DraggableItem>
                          </a>
                        </li>)
                }
               )}
            </ul>
            </div>
        </div>

      

            
        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[3] }}
        >
          <h4>
            <HiCollection />
            Item Groups
          </h4>
          {/* {sketchItemGroupColumnDisplay} */}
          
          <div className='xtractor-column-container'>         
            <ul>
              {sketchpad && itemGroupTypes.map((igt,index)=>(
                    
                    <li key={index}><a className={itemGroup === igt ? "active" : ""} 
                    onClick={() => dispatch(setItemGroup(igt))}>
                      <DraggableItem key={index} id={`${igt}`} type={igt.toUpperCase()}>
                      {igt.toUpperCase()} ({itemGroups[igt] !== null ? itemGroups[igt].length: 0})
                      </DraggableItem>
                      </a></li>                      
                ))}
              </ul>
        </div>
        </div>


        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[4] }}
        >
          <h4>
            <BsViewList />
            Items
          </h4>
          {/* {sketchItemGroupItemsColumnDisplay} */}
          <div className='xtractor-column-container'>            
              {itemDisplay}
          </div>
        </div>
        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[5] }}
        >
          <h4>
            <GiMagnifyingGlass />
            Details
          </h4>         
          {detailDisplay}
          {/* {sketchItemSelectedItemColumnDisplay} */}
        </div>


        </div>
     </div>     
    )
  
}

export default  SketchpadEditor;