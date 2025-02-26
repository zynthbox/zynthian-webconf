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
  setVersion,  
  setSamples,
  setTracks,
  setSongs,
  setPatterns,
  getPatterns,  
  getSounds,
  setItemGroupsReady,
  setItemGroup,
  setItem
}  from  '../../../store/sketchpad-manager/SketchpadMangerSlice'; 
const SketchpadEditor =(props)=> {
  const { colorsArray } = props;
  const [ urlToPlay, setUrlToPlay] = useState(null);
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
 
  useEffect(() => {      
      dispatch(getFolders())
  },[])

  useEffect(() => {
    if (folder !== null) dispatch(getSketchpadVersions(folder));      
    setUrlToPlay(null);       
  }, [folder]);

  useEffect(() => {   
    if (version !== null) dispatch(getSketchpad(version));
    setUrlToPlay(null);         
  }, [version]);
  
  useEffect(() => {
   if(sketchpad) handleSceneSelection();
   setUrlToPlay(null);       
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

     
  const playSample =(path,track)=>{    
    let dir = version.split('/home/pi/')[1].split('/');
    dir.pop();
    const urlToPlay = `http://${window.location.hostname}:3000/${dir.join('/')}/wav/sampleset/sample-bank.${track +1}/${path}`    
    if(urlToPlay){     
      setUrlToPlay(urlToPlay);            
    }
    // console.log('play Sample:',path,track);
  }

  let waveDisplay;
  if(urlToPlay){           
    waveDisplay =  <WavePlayer audioUrl={urlToPlay} />
  }

  function handleSceneSelection() {
   
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
    dispatch(setSamples(newSamples))
    dispatch(setTracks([]))
    dispatch(setSongs([]))
    dispatch(getPatterns())   
    dispatch(getSounds(version))
  }

  let itemDisplay;
  if(itemGroup){
    const items = itemGroups[itemGroup];    
    if(itemGroup=='samples'){
        itemDisplay = <ul>
          {items.map(item=>(<li> <a onClick={()=>playSample(item.path,item.track)}>
            <span>{item.path}</span>
            <small>Track: {item.track + 1} | Slot: {item.slot + 1}</small>
            </a> </li>))}
        </ul>
    }else if(itemGroup=='sounds'){     
        itemDisplay = <ul>
        {items.map(item=>(<li> <a>
          <span>{item.preset_name}</span>
          <small>{item.engine_name}</small>
          </a> </li>))}
          </ul>
    }else{
      itemDisplay = <ul><li>{JSON.stringify(items)}</li></ul>
    }
  }


    return (
      <div id="sketch-pad-xtractor">
      <div className="sketch-pad-xtractor-row">
        <div
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
               <li id={f.path} onClick={()=> dispatch(setFolder(f.path))}><a className={f.path === folder ? "active" : ""} >{f.name}</a></li>
            ))}
            </ul>
          </div>
        </div>

        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[1] }}
        >
          <h4>
            <GoVersions />
            Versions
          </h4>
          <div className='xtractor-column-container'>
          <ul>
            {versions && versions.map(f=>{
              const fileName = f.path.split('/')[f.path.split('/').length - 1];
              const folderName = f.path.split(fileName)[0];
               return (<li id={f.path} onClick={()=> dispatch(setVersion(f.path))}>
                        <a className={f.path === version ? "active" : ""}>{fileName}</a></li>)
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
                    <li><a className={itemGroup === igt ? "active" : ""} 
                    onClick={() => dispatch(setItemGroup(igt))}>
                      {igt.toUpperCase()} ({itemGroups[igt] !== null ? itemGroups[igt].length: 0})
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
          {waveDisplay}
          {/* {sketchItemSelectedItemColumnDisplay} */}
        </div>


        </div>
     </div>     
    )
  
}

export default  SketchpadEditor;