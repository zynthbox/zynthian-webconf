import React, { Suspense, lazy, useCallback, useState } from 'react'
import FileManagerContextProvider from './context/context-provider'
import LoadingSpinner from '../loading-spinner'
import { DIRECTORIES,colorsArray } from '../components/globalState'
import Split from 'react-split';
import TrackerModule from '../sample-manager/TrackerModule';
const SketchpadEditor = lazy(()=>import('../sketchpad-manager/SketchpadEditor'))
const SoundEditor = lazy(()=>import('../sound-manager/SoundEditor'))
const FileManager = lazy(()=>import('./file-manager'))
import { Helmet } from 'react-helmet';
function XtractorManagerContainer() {
    const [ rootDirectory, setRootDirectory ] = useState('/zynthian/zynthian-my-data/sketchpads/')
    const [ rootName, setRootName ] = useState('Sketchpads')
    const dirs = DIRECTORIES;
    
      // useCallback to optimize event handler
    const handleOnClick = useCallback((m) => {
        setRootDirectory(m.rootDirectory)
        setRootName(m.rootName)
    }, [])

  return (
    <>
        <Helmet>
              <title>Zynthbox - Xtractor - {rootName}</title>        
          </Helmet>
          <div id="sketchpad-manager-display" > 
          {/* <div id="file-manager2" className="tw:container tw:bg-white tw:w-screen tw:fixed  tw:top-[48px] tw:left-[20px] tw:mt-2 tw:mx-auto tw:p-0 tw:z-10" > */}
          <h3 className='tw:uppercase tw:flex tw:justify-between'>           
             <span><i className="glyphicon glyphicon-file"></i>Xtractor</span>
             <span> 
                    {dirs.map(m=>(
                      <button key={m.rootName} className={ m.rootName==rootName?'shadcnButton tw:border-b-2 tw:border-[#09f] ':'shadcnButton' } 
                      onClick={()=>handleOnClick(m)}>
                        {m.rootName}
                      </button>
                  ))}  
            </span>
          </h3>

          <Split 
            className="split" 
            sizes={[20, 80]}
            minSize={[250,500]}
            expandToMin={true}
            gutterSize={5}
            key={rootDirectory} 
            >    
            <FileManagerContextProvider 
                    key={rootDirectory} 
                    rootDirectory={rootDirectory}
                    rootName={rootName}
                    >          
                <div>
                    <div id="file-manager">                                       
                    <Suspense fallback={<LoadingSpinner/>}>
                          <FileManager  rootDirectory={rootDirectory} 
                                        key={rootDirectory}
                                        mode = {rootName}/>
                      </Suspense>                                    
                    </div>
                </div>

                  {(rootName == 'Sketchpads') &&
                    <div id="sketch-pad-xtractor-container" >   
                      <Suspense fallback={<LoadingSpinner/>}>                                 
                      <SketchpadEditor colorsArray={colorsArray}></SketchpadEditor> 
                      </Suspense>                                
                    </div>  
                  }
                  {(rootName == 'Sounds') &&
                      <div id="sound-editor-container" >                    
                          <Suspense fallback={<LoadingSpinner/>}>
                              <SoundEditor />
                          </Suspense>
                      </div>  
                  }
                   {(rootName == 'Samples') &&
                      <div>                                            
                          <TrackerModule/>
                      </div>  
                  }
                  {(rootName == 'Sketches' || rootName == 'Soundfonts' ) &&
                      <div className='tw:flex tw:justify-center tw:text-3xl tw:pt-5'>                                            
                          <span>Comming soon...</span>
                      </div>  
                  }

                </FileManagerContextProvider>           
            </Split>
            {/* <div className='tw:grid tw:grid-cols-12'>
              <FileManagerContextProvider 
                      key={rootDirectory} 
                      rootDirectory={rootDirectory}
                      rootName={rootName}>
              <div id="file-manager" className='tw:col-span-2'>                
                
                      <Suspense fallback={<LoadingSpinner/>}>
                          <FileManager  rootDirectory={rootDirectory} 
                                        key={rootDirectory}
                                        mode = {rootName}/>
                      </Suspense>
               
              </div>
              <div className='tw:col-span-10'>
                  {(rootName == 'Sketchpads') &&
                    <div id="sketch-pad-xtractor-container" >   
                      <Suspense fallback={<LoadingSpinner/>}>                                 
                      <SketchpadEditor colorsArray={colorsArray}></SketchpadEditor> 
                      </Suspense>                                
                    </div>  
                  }
                  {(rootName == 'Sounds') &&
                  <div id="sound-editor-container" >                    
                        <Suspense fallback={<LoadingSpinner/>}>
                            <SoundEditor />
                        </Suspense>
                    </div>  
                  }
              </div>
              </FileManagerContextProvider>
            </div> */}


          </div>
         
    </>
  )
}

export default XtractorManagerContainer