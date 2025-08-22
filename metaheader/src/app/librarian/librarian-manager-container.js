import React, { Suspense, lazy, useCallback, useState } from 'react'
import FileManagerContextProvider from './context/context-provider'
import LoadingSpinner from '../loading-spinner'
import { DIRECTORIES } from '../components/globalState'
import { fileManagerLeftCss } from '../helpers'
import { Helmet } from 'react-helmet';
const FileManager = lazy(()=>import('./file-manager'))
function LibrarianManagerContainer() {
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
              <title>Zynthbox - Librarian - {rootName}</title>        
          </Helmet>
          <div id="file-manager" className="container" style={{left:fileManagerLeftCss()}}> 
          {/* <div id="file-manager2" className="tw:container tw:bg-white tw:w-screen tw:fixed  tw:top-[48px] tw:left-[20px] tw:mt-2 tw:mx-auto tw:p-0 tw:z-10" > */}
          <h3 className='tw:uppercase tw:flex tw:justify-between'>           
             <span><i className="glyphicon glyphicon-file"></i>Librarian</span>
             <span> 
                    {dirs.map(m=>(
                      <button key={m.rootName} className={ m.rootName==rootName?'shadcnButton tw:border-b-2 tw:border-[#09f] ':'shadcnButton' } 
                      onClick={()=>handleOnClick(m)}>
                        {m.rootName}
                      </button>
                  ))}  
            </span>
          </h3>
          
            <FileManagerContextProvider 
                  key={rootDirectory} 
                  rootDirectory={rootDirectory}
                  rootName={rootName}>
                  <Suspense fallback={<LoadingSpinner/>}>
                      <FileManager  rootDirectory={rootDirectory} 
                                    key={rootDirectory}
                                    mode = 'file-manager'/>
                  </Suspense>
            </FileManagerContextProvider>
          </div>
          <div id="file-manager-overlay"></div>
    </>
  )
}

export default LibrarianManagerContainer