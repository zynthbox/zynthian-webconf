import React, { useEffect,Suspense,lazy } from 'react'
import LoadingSpinner from '../loading-spinner';
import Split from 'react-split';
import FileManagerContextProvider from './file-explore/context/context-provider';
import SketchpadEditor from './SketchpadEditor';

const FileExplore = lazy(()=>import('./file-explore/file-explore'))

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
    return (
        <>
            <Split className="split" sizes={[50, 50]}>
               
                <FileManagerContextProvider 
                    rootDirectory='/home/pi/zynthian-my-data/sketchpads/my-sketchpads/'
                    rootName='My Sketchpads'
                    >               
                <div>
                    <div id="file-manager">                                       
                    <Suspense fallback={<LoadingSpinner/>}>
                        <FileExplore rootDirectory='/home/pi/zynthian-my-data/sketchpads/my-sketchpads/' 
                                     module = 'sketchpad-manager'
                        />
                    </Suspense>                                       
                    </div>
                </div>
                <div id="sketch-pad-xtractor-container" className="container" >                                      
                    <SketchpadEditor colorsArray={colorsArray}></SketchpadEditor>                               
                </div>                               
                </FileManagerContextProvider>
               
            </Split> 
        </>
    )
}
export default SketchpadManager