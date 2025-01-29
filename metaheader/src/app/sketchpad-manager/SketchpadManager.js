import React, { useEffect,Suspense,lazy } from 'react'
import LoadingSpinner from '../loading-spinner';
import Split from 'react-split';
import FileManagerContextProvider from './file-explore/context/context-provider';
import SketchpadEditor from './SketchpadEditor';
const FileExplore = lazy(()=>import('./file-explore/file-explore'))
const SketchpadManager =()=>{
    return (
        <>
           <Split className="split">
                <FileManagerContextProvider>
                <div>
                    <div id="file-manager">                    
                   
                    <Suspense fallback={<LoadingSpinner/>}>
                        <FileExplore/>
                    </Suspense>                    
                   
                    </div>
                </div>
                <div>
                   <SketchpadEditor />
                </div>
                </FileManagerContextProvider>
            </Split>
        </>
    )
}
export default SketchpadManager