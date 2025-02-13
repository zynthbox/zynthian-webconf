import React, { useEffect,Suspense,lazy } from 'react'
import LoadingSpinner from '../loading-spinner';
import Split from 'react-split';
import FileManagerContextProvider from './file-explore/context/context-provider';
const FileExplore = lazy(()=>import('./file-explore/file-explore'))
const SoundEditor = lazy(()=>import('./SoundEditor'))

const SoundManager =()=>{
    return (
        <>
            <FileManagerContextProvider>
            <Split className="split" sizes={[40, 60]}>                
                <div>
                    <div id="file-manager">                                       
                    <Suspense fallback={<LoadingSpinner/>}>
                        <FileExplore/>
                    </Suspense>                    
                   
                    </div>
                </div>
                <div id="sound-editor-container" className="container" >                    
                    <Suspense fallback={<LoadingSpinner/>}>
                        <SoundEditor />
                    </Suspense>
                </div>                
            </Split>
            </FileManagerContextProvider> 
        </>
    )
}
export default SoundManager