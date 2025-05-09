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



const itemsPerPage = 2; // Number of items per page

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

const SoundEditor = () => {    

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

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
    const [ soundInfoToDisplay, setSoundInfoToDisplay] = useState(null);

    useEffect(() => {          
      dispatch(initFilesCategories(folderSelected))    
      setUrlToPlay(null);     
      setCurrentPage(1);               
    },[folderSelected])

    useEffect(() => {                        
      setFilesToDisplay(files)         
    },[files])
    
    useEffect(() => {       
      // dispatch(getSoundMeta())        
      if(soundSelected){               
        let path = (soundSelected.indexOf('/home/pi/')>-1) ? soundSelected.split('/home/pi/')[1] : soundSelected ;   
        let url = `http://${window.location.hostname}:3000/${path}`
        setUrlToPlay(url);
      }
    },[soundSelected])

 
    const filterCategory = (catId)=>{
      dispatch(selectCategory(catId))   
      setUrlToPlay(null); 
      setCurrentPage(1); 
      if(catId){
        const fList = files.filter(f=>f['catId'] == catId);
        setFilesToDisplay(fList);
      }else{
        setFilesToDisplay(files);
      }      
    }

    const handleClickSound = (file)=>{
      dispatch(selectSound(file))            
      const fileInfo = files.filter(f=>f.path==file)[0];      
      const info ={...fileInfo,samples:[]}          
      setSoundInfoToDisplay(info);
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
    if(soundInfoToDisplay){
       metaDisplay = <div className="sound-meta">
                        <table className='tw:table-auto tw:border-1 tw:border-gray-200 tw:p-2 tw:m-2'>
                        <caption className='tw:font-bold'>
                         {soundInfoToDisplay.name}
                        </caption>
                          <tr>
                            <td className='tw:bg-[#eee]'><span className='tw:p-2 tw:m-2 tw:font-bold'>Samples</span></td>
                            {soundInfoToDisplay.sampleSlotsData.map((s,i)=>(
                              <td key={i}>                                
                                {s} 
                              </td>
                            ))}     
                          </tr>
                          <tr>
                            <td className='tw:bg-[#eee]'><span className='tw:p-2 tw:m-2 tw:font-bold'>Synths</span></td>
                            {soundInfoToDisplay.synthSlotsData.map((s,i)=>(
                              <td key={i} >{s}</td>
                            ))}      
                          </tr>
                          <tr>
                            <td className='tw:bg-[#eee]'><span className='tw:p-2 tw:m-2 tw:font-bold'>Fx</span></td>
                            {soundInfoToDisplay.fxSlotsData.map((s,i)=>(
                              <td key={i} >{s}</td>
                            ))}    
                          </tr>
                        </table>
                      </div>
     
    }
    
    let categoriesDisplay;
    if(categories){
      categoriesDisplay = <ul className='categories'>
                          <li key='all' onClick={()=>filterCategory()} className={ categorySelected? 'nav-button': 'nav-button selected'}> All {files ? ' ['+files.length+']':''} </li>
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

   

    // Filter data based on search query
    let filteredData = [];
    if(filesToDisplay!=null){
      filteredData = filesToDisplay.filter((item) =>
       item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } 

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Get paginated data
    const paginatedData = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    // Handle search input change
    const handleSearch = (event) => {
      setSearchQuery(event.target.value);
      setCurrentPage(1); // Reset to first page when searching
    };

    // Handle pagination
    const goToPage = (page) => setCurrentPage(page);
    
    let filesDisplay=null;
    if(paginatedData){
      filesDisplay =    <ul className='files'>
                          {paginatedData.map((f,index)=>                                                          
                                <li key={index} className={(soundSelected==f.path)?'selected':''}>                                                                                                      
                                      <span onClick={()=>handleClickSound(f.path)}>
                                        <DraggableItem id={f.path} type={'FILE'}>
                                          <BsFileMusic className='tw:inline tw:mx-1' />{f.name }
                                        </DraggableItem>                             
                                        {/* <BsFileMusic className='inline' />  {f.name } */}
                                      </span>                                                                      
                                </li>                             
                          )}
                                                   
                          </ul>
    }

    let folderDisplay;
    folderDisplay = <select value={folderSelected} onChange={(e)=>{dispatch(selectFolder(e.target.value))}}>                        
                        <option key='my-sounds' value="/home/pi/zynthian-my-data/sounds/my-sounds/">my-sounds</option>
                        <option key='community-sounds' value="/home/pi/zynthian-my-data/sounds/community-sounds/">community-sounds</option>
                        <option key='default-sounds' value="/home/pi/zynthian-my-data/sounds/default-sounds/">default-sounds</option>
                     </select>

  return (  
              <div className="tw:grid tw:sm:grid-cols-12">
                <div className="tw:sm:col-span-12 tw:border-b-1 tw:border-gray-300 tw:rounded-xl tw:shadow-2xs tw:p-2 tw:m-2">
                  <div className='tw:flex tw:justify-between tw:mx-3'>
                   {folderDisplay}
                   <input type="text"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={handleSearch}
                      />
                  </div>
                </div>
                <div className="tw:sm:col-span-3  tw:min-h-[300px] tw:border-r-1 tw:border-gray-300 tw:p-2 tw:m-2 ">
                  <nav className="nav">{categoriesDisplay}</nav>
                </div>
                <div className="tw:sm:col-span-9 tw:p-2 tw:m-2 tw:sm:flex">
                    <div className="tw:pl-2 tw:ml-2 tw:flex-2 tw:flex tw:flex-col tw:justify-between">                                        
                    {filesDisplay}

                    {totalPages>1 && 
                      <div className='tw:flex tw:m-2 tw:p-2 tw:gap-2'>
                        <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>Prev</button>                
                        {Array.from({ length: totalPages }, (_, index) => (                
                          <button                
                            key={index + 1}                
                            onClick={() => goToPage(index + 1)}                
                            disabled={currentPage === index + 1}   
                            className={currentPage === index + 1 ?' tw:underline tw:bg-[#eef] tw:p-2 tw:m2':' tw:p-2'}             
                          >                
                            {index + 1}                
                          </button>                
                        ))}                
                        <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>Next</button>                
                      </div>
                    }

                    </div>
                    <div className="tw:pl-2 tw:ml-10 tw:flex-2">
                    {waveDisplay}
                    </div>

                </div>
                <div className="tw:sm:col-span-12 tw:sm:min-h-[200px] tw:p-2 tw:m-2 tw:border-t-1 tw:border-gray-300">
                  {metaDisplay}
                </div>
              </div>                                                                                                               
  )
}
export default SoundEditor

