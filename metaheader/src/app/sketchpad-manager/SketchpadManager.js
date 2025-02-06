import React, { useEffect,Suspense,lazy } from 'react'
import LoadingSpinner from '../loading-spinner';
import Split from 'react-split';
import FileManagerContextProvider from './file-explore/context/context-provider';
const FileExplore = lazy(()=>import('./file-explore/file-explore'))
// const SampleEditor = lazy(()=>import('../../../store/sampleEditor/SampleEditor'))
const SketchpadXtractor = lazy(()=>import('../../../store/sketchpadXtractor/SketchpadXtractor'))

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
           <Split className="split" sizes={[20, 80]}>
                <FileManagerContextProvider>
                <div>
                    <div id="file-manager">                    
                   
                    <Suspense fallback={<LoadingSpinner/>}>
                        <FileExplore/>
                    </Suspense>                    
                   
                    </div>
                </div>
                <div id="sketch-pad-xtractor-container" className="container" >                    
                    <Suspense fallback={<LoadingSpinner/>}>
                        <SketchpadXtractor colorsArray={colorsArray} />
                    </Suspense>
                </div>
                </FileManagerContextProvider>
            </Split>
        </>
    )
}
export default SketchpadManager