import React, { useEffect,useRef,useState,lazy, Suspense } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { initFilesCategories,
  getSoundMeta,
  selectFolder,
  selectCategory,
  selectSound } from  '../../../store/sound-manager/SoundManagerSlice'; 
import WavePlayer from '../components/WavePlayer';
import { BsFileMusic } from "react-icons/bs";
import { FaRegPlayCircle } from "react-icons/fa";
import DraggableItem from '../components/DraggableItem';


function decodeBase64Audio(base64String) {    
  let base64Data = base64String.replace(/^data:audio\/\w+;base64,/, "");
  let byteCharacters = atob(base64Data);
  let byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  let audioBlob = new Blob([byteNumbers], { type: "audio/wav" });
  let audioUrl = URL.createObjectURL(audioBlob);
  return audioUrl;
}

const SoundEditor = ({isDraggable}) => {    
    const dispatch = useDispatch();    
    const {folderSelected
          ,files
          ,categories
          ,soundSelected 
          ,categorySelected
          ,soundInfo
         } = useSelector((state) => state.soundmanager);
   
    // private state
    const [ filesToDisplay, setFilesToDisplay] = useState(null);
    const [ urlToPlay, setUrlToPlay] = useState(null);

    useEffect(() => {          
      dispatch(initFilesCategories(folderSelected))    
      setUrlToPlay(null);                    
    },[folderSelected])

    useEffect(() => {                        
      setFilesToDisplay(files)         
    },[files])
    
    useEffect(() => {       
      dispatch(getSoundMeta())        
      if(soundSelected){               
        let path = (soundSelected.indexOf('/home/pi/')>-1) ? soundSelected.split('/home/pi/')[1] : soundSelected ;   
        let url = `http://${window.location.hostname}:3000/${path}`
        setUrlToPlay(url);
      }
    },[soundSelected])

 
    const filterCategory = (catId)=>{
      dispatch(selectCategory(catId))   
      setUrlToPlay(null); 
      if(catId){
        const fList = files.filter(f=>f['catId'] == catId);
        setFilesToDisplay(fList);
      }else{
        setFilesToDisplay(files);
      }      
    }

    const handleClickSound = (file)=>{
      dispatch(selectSound(file))       
    }
    
    const playSample = (i)=>{
      if(soundInfo && soundInfo.samples){
        const sample = soundInfo.samples[i];
        const url = decodeBase64Audio(sample);
        setUrlToPlay(url);
      }      
    }
    

    let waveDisplay;
    if(urlToPlay){           
      waveDisplay =  <WavePlayer audioUrl={urlToPlay} />
    }

    let metaDisplay = null;
    if(soundInfo){
       metaDisplay = <div class="sound-meta">
                        <table>
                        <caption>
                        Category:{soundInfo.category}
                        </caption>
                          <tr>
                            <td className='t_label'>Samples</td>
                            {soundInfo.sampleSlotsData.map((s,i)=>(
                              <td key={i}>
                                {s &&
                                <a onClick={()=>playSample(i)}><BsFileMusic/>{s}</a>
                                }
                              </td>
                            ))}     
                          </tr>
                          <tr>
                            <td className='t_label'>Synths</td>
                            {soundInfo.synthSlotsData.map((s,i)=>(
                              <td key={i} >{s}</td>
                            ))}      
                          </tr>
                          <tr>
                            <td className='t_label'>Fx</td>
                            {soundInfo.fxSlotsData.map((s,i)=>(
                              <td key={i} >{s}</td>
                            ))}    
                          </tr>
                        </table>
                      </div>

      // metaDisplay = <div class="sound-meta">
      //                 <div class="rowMeta">Category:{soundInfo.category}</div>
      //                 <div class="rowMeta">
      //                   <div class="columnMeta">Samples</div>
      //                   {soundInfo.sampleSlotsData.map((s,i)=>(
      //                         <div class="columnMeta" key={i}>
      //                           {s &&
      //                           <a onClick={()=>playSample(i)}><BsFileMusic/>{s}</a>
      //                           }
      //                         </div>
      //                       ))}                            
      //                 </div>
      //                 <div class="rowMeta">
      //                   <div class="columnMeta">Synths</div>
      //                   {soundInfo.synthSlotsData.map((s,i)=>(
      //                         <div key={i}  class="columnMeta">{s}</div>
      //                       ))}   
      //                 </div>
      //                 <div class="rowMeta">
      //                   <div class="columnMeta">Fx</div>
      //                   {soundInfo.fxSlotsData.map((s,i)=>(
      //                         <div key={i} class="columnMeta">{s}</div>
      //                       ))}    
      //                 </div> 
      //               </div>

      // metaDisplay = <div className='sound-meta'> 
      //                 <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "2px" }}>    
      //                   <div style={{ display: "flex", gap: "2px" }}>Category:{soundInfo.category}</div>           
      //                   <div style={{ display: "flex", gap: "2px" }}>
      //                     <div style={{ width: "16.6%", backgroundColor: "#ccc", padding: "2px" }}>Samples</div>
      //                       {soundInfo.sampleSlotsData.map((s,i)=>(
      //                         <div key={i} style={{ width: "16.6%", backgroundColor: "#eef", padding: "2px" }}>
      //                           {s &&
      //                           <a onClick={()=>playSample(i)}><BsFileMusic/>{s}</a>
      //                           }
      //                         </div>
      //                       ))}                  
      //                   </div>
      //                   <div style={{ display: "flex", gap: "2px" }}>
      //                     <div style={{ width: "16.6%", backgroundColor: "#ccc", padding: "2px" }}>Synths</div>
      //                       {soundInfo.synthSlotsData.map((s,i)=>(
      //                         <div key={i}  style={{ width: "16.6%", backgroundColor: "#eef", padding: "2px" }}>{s}</div>
      //                       ))}                  
      //                   </div>
      //                   <div style={{ display: "flex", gap: "2px" }}>
      //                     <div style={{ width: "16.6%", backgroundColor: "#ccc", padding: "2px" }}>Fx</div>
      //                       {soundInfo.fxSlotsData.map((s,i)=>(
      //                         <div key={i} style={{ width: "16.6%", backgroundColor: "#eef", padding: "2px" }}>{s}</div>
      //                       ))}                  
      //                   </div>
      //                 </div>
      //               </div>
    }
    
    let categoriesDisplay;
    if(categories){
      categoriesDisplay = <ul className='categories'>
                          <li key='all' onClick={()=>filterCategory()} className='nav-button'> All {files ? ' ['+files.length+']':''} </li>
                          {categories.map(c=>{                            
                              const clsLi = (categorySelected==c.catId)?'nav-button selected':'nav-button'
                              return (
                                <li key={c.catId} className={clsLi}                                     
                                    onClick={()=>filterCategory(c.catId)}> 
                                    {c.catName +(c.cntFiles>0?' ['+c.cntFiles+']':'')}
                                </li>
                              ) 
                          })}
                          </ul>
      
    }    

    let filesDisplay;
    if(filesToDisplay){
      filesDisplay =    <ul className='files'>
                          {filesToDisplay.map(f=>{
                              const clsLi = (soundSelected==f.path)?'selected':''
                              return (
                                <li key={f.path} className={clsLi}> <BsFileMusic />                                  
                                  {/* {isDraggable &&  */}
                                    <DraggableItem key={'draggable'+f.path} item={f.path} id={f.path} type={'FILE'}>
                                      <span onClick={()=>handleClickSound(f.path)}>
                                                                        {f.name }                            
                                                                        </span>
                                      </DraggableItem>
                                    {/* } */}
                                </li>
                              ) 
                          })}
                          </ul>
    }

    let folderDisplay;
    folderDisplay = <select value={folderSelected} onChange={(e)=>{dispatch(selectFolder(e.target.value))}}>                        
                        <option key='my-sounds' value="/home/pi/zynthian-my-data/sounds/my-sounds/">my-sounds</option>
                        <option key='community-sounds' value="/home/pi/zynthian-my-data/sounds/community-sounds/">community-sounds</option>
                        <option key='default-sounds' value="/home/pi/zynthian-my-data/sounds/default-sounds/">default-sounds</option>
                     </select>

  return (     
            <div className="layout">              
              <header className="header">          
                {folderDisplay}</header>
              <div className="body">               
                <nav className="nav">{categoriesDisplay}</nav>
                <main className="content">
                  <div className="scrollable">
                    {waveDisplay}
                    {filesDisplay}
                    </div>
                </main>
              </div>
              {metaDisplay}
              {/* <footer className="footer"> </footer> */}
            </div>                                                                                                   
  )
}
export default SoundEditor

