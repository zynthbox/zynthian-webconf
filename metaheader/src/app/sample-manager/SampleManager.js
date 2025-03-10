import React, { useEffect,Suspense,lazy } from 'react'
import LoadingSpinner from '../loading-spinner';
import Split from 'react-split';
import FileManagerContextProvider from '../components/file-explore/context/context-provider';
import TrackerModule from './TrackerModule';
const FileExplore = lazy(()=>import('../components/file-explore/file-explore'))
const SampleManger =()=>{
    
    return (
        <>
         
           <Split className="split">
                <div>
                    <div id="file-manager">                    
                    <FileManagerContextProvider rootDirectory='/home/pi/zynthian-my-data/samples/'
                    rootName='Samples'>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <FileExplore rootDirectory='/home/pi/zynthian-my-data/samples/' 
                                     mode = 'sample-manager'/>
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