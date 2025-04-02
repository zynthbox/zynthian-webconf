import React, { useEffect,Suspense,lazy } from 'react'
import LoadingSpinner from '../loading-spinner';
import Split from 'react-split';
import FileManagerContextProvider from '../components/file-explore/context/context-provider';
import SketchpadEditor from './SketchpadEditor';

const FileExplore = lazy(()=>import('../components/file-explore/file-explore'))

const colorsArray = [
    "#B23730",
    "#EE514B",
    "#F77535",
    "#F7D635",
    "#FE68B1",
    "#A438FF",
    "#6491FF",
    "#73F6EE",
    "#65E679",
    "#9A7136",
];
const SketchpadManager =()=>{
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
            <Split className="split" 
                sizes={[20, 80]}
                minSize={[250,500]}
                expandToMin={true}
                gutterSize={5}
            >
               
                <FileManagerContextProvider 
                    rootDirectory='/zynthian/zynthian-my-data/sketchpads/my-sketchpads/'
                    rootName='My Sketchpads'
                    >               
                <div>
                    <div id="file-manager">                                       
                    <Suspense fallback={<LoadingSpinner/>}>
                        <FileExplore rootDirectory='/zynthian/zynthian-my-data/sketchpads/my-sketchpads/' 
                                     mode = 'sketchpad-manager'
                        />
                    </Suspense>                                       
                    </div>
                </div>
                <div id="sketch-pad-xtractor-container" >                                      
                    <SketchpadEditor colorsArray={colorsArray}></SketchpadEditor>                               
                </div>                               
                </FileManagerContextProvider>
               
            </Split> 
        </>
    )
}
export default SketchpadManager