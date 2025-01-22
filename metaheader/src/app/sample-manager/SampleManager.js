import React, { useEffect,Suspense,lazy } from 'react'
import LoadingSpinner from '../loading-spinner';
import Split from 'react-split';
import FileManagerContextProvider from './file-explore/context/context-provider';
const FileExplore = lazy(()=>import('./file-explore/file-explore'))
/**
 * 
 * correct uploading: url: '/upload/zynthian-my-data+++samples+++my-samples+++test+++',
 * wrong: '/upload/my-samples+++test+++',
 */
const SampleManger =()=>{
    return (
        <>
           <Split
                className="split"
            >
                <div>
                    <div id="file-manager">                    
                    <FileManagerContextProvider>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <FileExplore/>
                    </Suspense>                    
                    </FileManagerContextProvider>
                    </div>
                </div>
                <div>Right</div>
            </Split>
        </>
    )
}
export default SampleManger