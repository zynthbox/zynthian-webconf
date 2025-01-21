import {createBrowserRouter, createRoutesFromElements  
    ,Route
    , RouterProvider} from 'react-router-dom'
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store'
import ReactDOM from 'react-dom/client';
import FileManagerContextProvider from './app/file-manager/context/context-provider';
import LoadingSpinner from './app/loading-spinner';
import RootLayout from './layouts/RootLayout';
import NotFound from './app/NotFound';

const FileManager = lazy(()=>import('./app/file-manager/file-manager'))
const SampleManger= lazy(()=>import('./app/sample-manager/SampleManager'))
const SampleEditor = lazy(()=>import('../store/sampleEditor/SampleEditor'))
const Favorites = lazy(()=>import('../store/favorites/favorites'))
const SketchPadXtractor = lazy(()=>import('../store/sketchpadXtractor/SketchpadXtractor')) 
const SongExport = lazy(()=>import('../store/songExport/SongExport'))
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
function fileManagerLeftCss(){
    let fileManagerLeftCss = 0;
    const containerElement = document.getElementsByClassName('container')[0];
    if (containerElement && containerElement !== null){
        fileManagerLeftCss = (window.innerWidth - containerElement.offsetWidth) / 2
    }
    return fileManagerLeftCss;
}

function FileManagerDisplay(){
    return (
            <>
                <div id="file-manager" className="container" style={{left:fileManagerLeftCss()}}>
                <h3>
                    <i className="glyphicon glyphicon-file"></i>
                    FILE MANAGER
                </h3>
                <FileManagerContextProvider>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <FileManager/>
                    </Suspense>
                </FileManagerContextProvider>
                </div>
                <div id="file-manager-overlay"></div>
            </>
    )
}

function SampleManagerDisplay(){
    return (
        <>
            <div id="sample-manager-display" className="container" style={{left:fileManagerLeftCss()}}>
            <h3>
                <i className="glyphicon glyphicon-file"></i>
                SAMPLE MANAGER
            </h3>
            <Suspense fallback={<LoadingSpinner/>}>
                <SampleManger  />
            </Suspense>                        
           </div>          
        </>
)
}

function SampleEditorDisplay(){
    return (
            <React.Fragment>
               
                <div id="sample-editor-container" className="container" style={{left:fileManagerLeftCss()}}>
                    <h3>
                    TRACK MANAGER
                    </h3>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <SampleEditor colorsArray={colorsArray} />
                    </Suspense>
                </div>
                <div id="sample-editor-overlay"></div>
               
            </React.Fragment>
    )
}

function SoundManagerDisplay(){
    return(
        <React.Fragment>
               
                <div id="favorites-container" className="container" style={{left:fileManagerLeftCss()}}>
                    <h3>
                        SOUND MANAGER
                    </h3>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <Favorites colorsArray={colorsArray} /> 
                    </Suspense>
                </div>
                <div id="favorites-overlay"></div>
                
            </React.Fragment>
    )
}


function XtractorDisplay(){
    return(
        <React.Fragment>
       
         <div id="sketch-pad-xtractor-container" className="container" style={{left:fileManagerLeftCss()}}>
            <h3>
                SketchPad Xtractor
            </h3>
            <Suspense fallback={<LoadingSpinner/>}>
                <SketchPadXtractor colorsArray={colorsArray} />
            </Suspense>
        </div>
        <div id="sketch-pad-xtractor-overlay"></div>
       
        </React.Fragment>
    )
}

function SongExportDisplay(){
    return(
        <React.Fragment>
       
        <div id="song-export-container" className="container" style={{left:fileManagerLeftCss()}}>
            <h3>
                Song Export
            </h3>
            <Suspense fallback={<LoadingSpinner/>}>
                <SongExport />
            </Suspense>
        </div>
        <div id="song-export-overlay"></div>
      
        </React.Fragment>
    )
}

const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route path="file-manager" element={<FileManagerDisplay />}></Route>
        <Route path="sample-manager" element={<SampleManagerDisplay />}></Route>
        <Route path="track-manager" element={<SampleEditorDisplay />}></Route>
        <Route path="sound-manager" element={<SoundManagerDisplay />}> </Route>
        <Route path="sketchpad-xtractor" element={<XtractorDisplay />}></Route>
        <Route path="song-export" element={<SongExportDisplay />}></Route>
        <Route path='*' element={<NotFound />}></Route>
     </Route>
    )
  )

function App(){    
    return (
        <RouterProvider router={router} />
    )
}
const root = ReactDOM.createRoot(document.getElementById('metaheader-container'));
root.render(<App />);