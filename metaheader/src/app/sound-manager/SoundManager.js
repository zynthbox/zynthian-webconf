import React, {useEffect,Suspense,lazy } from 'react'
import LoadingSpinner from '../loading-spinner';
import Split from 'react-split';
import FileManagerContextProvider from '../components/file-explore/context/context-provider';
const FileExplore = lazy(()=>import('../components/file-explore/file-explore'))
const SoundEditor = lazy(()=>import('./SoundEditor'))

const SoundManager =()=>{
   
    return (
        <>        
            <Split 
            className="split" 
            sizes={[20, 80]}
            minSize={[250,500]}
            expandToMin={true}
            gutterSize={5}
            >    
            <FileManagerContextProvider 
                    rootDirectory='/home/pi/zynthian-my-data/sounds/'
                    rootName='Sounds'
                    >          
                <div>
                    <div id="file-manager">                                       
                    <Suspense fallback={<LoadingSpinner/>}>
                        <FileExplore rootDirectory='/home/pi/zynthian-my-data/sounds/' 
                                     mode = 'sound-manager'/>
                    </Suspense>                    
                   
                    </div>
                </div>
                <div id="sound-editor-container" >                    
                    <Suspense fallback={<LoadingSpinner/>}>
                        <SoundEditor />
                    </Suspense>
                </div>       
                </FileManagerContextProvider>           
            </Split>
            
        </>
    )
}
export default SoundManager