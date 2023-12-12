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

const FileManager = lazy(()=>import('./app/file-manager/file-manager'))
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
function SampleEditorDisplay(){
    return (
            <React.Fragment>
                <Provider store={store}>
                <div id="sample-editor-container" className="container" style={{left:fileManagerLeftCss()}}>
                    <h3>
                        SAMPLE {'&'} PATTERN EDITOR
                    </h3>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <SampleEditor colorsArray={colorsArray} />
                    </Suspense>
                </div>
                <div id="sample-editor-overlay"></div>
                </Provider>
            </React.Fragment>
    )
}

function FavoritesDisplay(){
    return(
        <React.Fragment>
                <Provider store={store}>
                <div id="favorites-container" className="container" style={{left:fileManagerLeftCss()}}>
                    <h3>
                        Favorites
                    </h3>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <Favorites colorsArray={colorsArray} /> 
                    </Suspense>
                </div>
                <div id="favorites-overlay"></div>
                </Provider>
            </React.Fragment>
    )
}


function XtractorDisplay(){
    return(
        <React.Fragment>
        <Provider store={store}>
         <div id="sketch-pad-xtractor-container" className="container" style={{left:fileManagerLeftCss()}}>
            <h3>
                SketchPad Xtractor
            </h3>
            <Suspense fallback={<LoadingSpinner/>}>
                <SketchPadXtractor colorsArray={colorsArray} />
            </Suspense>
        </div>
        <div id="sketch-pad-xtractor-overlay"></div>
        </Provider>
        </React.Fragment>
    )
}

function SongExportDisplay(){
    return(
        <React.Fragment>
        <Provider store={store}>
        <div id="song-export-container" className="container" style={{left:fileManagerLeftCss()}}>
            <h3>
                Song Export
            </h3>
            <Suspense fallback={<LoadingSpinner/>}>
                <SongExport />
            </Suspense>
        </div>
        <div id="song-export-overlay"></div>
        </Provider>
        </React.Fragment>
    )
}

const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route path="file-manager" element={<FileManagerDisplay />}></Route>
        <Route path="sample-pattern-editor" element={<SampleEditorDisplay />}></Route>
        <Route path="favorites" element={<FavoritesDisplay />}> </Route>
        <Route path="sketchpad-xtractor" element={<XtractorDisplay />}></Route>
        <Route path="song-export" element={<SongExportDisplay />}></Route>
     </Route>
    )
  )

function App(){

    useEffect(() => {
        const handleBeforeUnload = (event) => {
          event.preventDefault();
          // Custom logic to handle the refresh
          // Display a confirmation message or perform necessary actions          
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      }, []);
    return (
        <RouterProvider router={router} />
    )
}
const root = ReactDOM.createRoot(document.getElementById('metaheader-container'));
root.render(<App />);