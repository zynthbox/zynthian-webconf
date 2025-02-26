import React, { useEffect,Suspense,lazy } from 'react'
import LoadingSpinner from '../loading-spinner';
import Split from 'react-split';
import FileManagerContextProvider from './file-explore/context/context-provider';
import TrackerModule from './TrackerModule';
const FileExplore = lazy(()=>import('./file-explore/file-explore'))
const SampleManger =()=>{
    
    return (
        <>
         
           <Split className="split">
                <div>
                    <div id="file-manager">                    
                    <FileManagerContextProvider>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <FileExplore/>
                    </Suspense>                    
                    </FileManagerContextProvider>
                    </div>
                </div>
                <div>
                    <TrackerModule/>
                </div>
            </Split>
        </>
    )
}
export default SampleManger