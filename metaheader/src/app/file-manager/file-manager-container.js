import React, { Suspense, lazy, useCallback, useState } from 'react'
import FileManagerContextProvider from './context/context-provider'
import LoadingSpinner from '../loading-spinner'
const FileManager = lazy(()=>import('./file-manager'))
import { Helmet } from 'react-helmet';
function FileManagerContainer() {   
  return (
    <>
    <Helmet>
        <title>Zynthbox - File Manager</title>        
    </Helmet>
    <FileManagerContextProvider rootDirectory='/zynthian/'
    rootName='Zynthian'>
    <Suspense fallback={<LoadingSpinner/>}>
        <FileManager rootDirectory='/zynthian/'                    
                     mode = 'file-manager'/>
    </Suspense>
    </FileManagerContextProvider>
    </>
  )
}

export default FileManagerContainer