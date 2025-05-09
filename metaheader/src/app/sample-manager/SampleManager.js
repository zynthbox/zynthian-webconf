import React, { useEffect,Suspense,lazy } from 'react'
import LoadingSpinner from '../loading-spinner';
import Split from 'react-split';
import FileManagerContextProvider from '../components/file-explore/context/context-provider';
import TrackerModule from './TrackerModule';
import TrackerExtractor from './TrackerExtractor';
const FileExplore = lazy(()=>import('../components/file-explore/file-explore'))

const SampleManger =()=>{
    useEffect(() => {
        const path = window.location.pathname;
        const hash = window.location.hash;         
        if (path !== "/" && path !== "") {
          window.location.replace(window.location.origin + "/#/" + hash.replace(/^#\/?/, ""));
        }
        // clear content-section
        document.querySelectorAll('.content-section').forEach(element => {
            element.innerHTML = ''; // Clear the content
          });
      }, []);
      
    return (
        <>
          {/* <TrackerExtractor></TrackerExtractor>          */}
          <Split className="split"
          sizes={[50, 50]}
          minSize={[600,300]}
          expandToMin={true}
          gutterSize={5}
          >
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