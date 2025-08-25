
import { createHashRouter,createRoutesFromElements  
    ,Route
    , RouterProvider} from 'react-router-dom'
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store'
import ReactDOM from 'react-dom/client';
// import FileManagerContextProvider from './app/file-manager/context/context-provider';
import LoadingSpinner from './app/loading-spinner';
import RootLayout from './layouts/RootLayout';
import NotFound from './app/NotFound';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
// import FileManagerContainer from './app/file-manager/file-manager-container';
import LibrarianManagerContainer from './app/librarian/librarian-manager-container';
import { fileManagerLeftCss } from './app/helpers';
import XtractorManagerContainer from './app/xtractor/xtractor-manager-container';
import ResourcesManagerContainer from './app/librarian/resources-manager-container';
import FileManagerContainerNew from './app/librarian/file-manager-container';

// import { io } from "socket.io-client";
// import { ToastContainer, toast } from 'react-toastify';

const SketchpadManager = lazy(()=>import('./app/sketchpad-manager/SketchpadManager'))
const SoundManager = lazy(()=>import('./app/sound-manager/SoundManager'))
// const FileManager = lazy(()=>import('./app/file-manager/file-manager'))
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



function FileManagerDisplay(){
    return (
            <>
                <div id="file-manager" className="container" style={{left:fileManagerLeftCss()}}>
                <h3>
                    <i className="glyphicon glyphicon-file"></i>
                    FILE MANAGER
                </h3>
                <FileManagerContainerNew></FileManagerContainerNew>
                </div>
                <div id="file-manager-overlay"></div>
            </>
    )
}

// function LibrarianManagerDisplay(){
//     return (
//             <>
//                 <div id="file-manager" className="container" style={{left:fileManagerLeftCss()}}> 
//                 {/* <div id="file-manager2" className="tw:container tw:bg-white tw:w-screen tw:fixed  tw:top-[48px] tw:left-[20px] tw:mt-2 tw:mx-auto tw:p-0 tw:z-10" > */}
//                 <h3 className='tw:uppercase'>
//                  <i className="glyphicon glyphicon-file"></i>
//                     Librarian
//                 </h3>
//                 <LibrarianManagerContainer></LibrarianManagerContainer>
//                 </div>
//                 <div id="file-manager-overlay"></div>
//             </>
//     )
// }


function SketchpadManagerDisplay(){
    return (
        <>
            <div id="sketchpad-manager-display"  style={{left:fileManagerLeftCss()}} >
            <h3>
                <i className="glyphicon glyphicon-file"></i>
                SKETCHPAD MANAGER
            </h3>
            <Suspense fallback={<LoadingSpinner/>}>
                <SketchpadManager  />
            </Suspense>                        
           </div>          
        </>
    )
}

function SoundManagerDisplay(){
    return(
        <React.Fragment>               
                <div id="sound-manager-display"  style={{left:fileManagerLeftCss()}}>
                    <h3>
                    <i className="glyphicon glyphicon-file"></i>SOUND MANAGER
                    </h3>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <SoundManager />
                    </Suspense> 
                </div>
                
            </React.Fragment>
    )
}

function SampleManagerDisplay(){
    return (
        <>
            <div id="sample-manager-display"  style={{left:fileManagerLeftCss()}}>
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
               
                <div id="sample-editor-container"  className="container" style={{left:fileManagerLeftCss()}}>
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

function SoundManagerOldDisplay(){
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

const router = createHashRouter(
    createRoutesFromElements(     
      <Route path="/" element={<RootLayout />}>
        <Route path="librarian" element={<LibrarianManagerContainer />}> </Route> 
        <Route path="resources" element={<ResourcesManagerContainer />}> </Route>         
        <Route path="xtractor" element={<XtractorManagerContainer />}> </Route>        
        <Route path="sound-manager" element={<SoundManagerDisplay />}> </Route>
        <Route path="sketchpad-manager" element={<SketchpadManagerDisplay />}></Route>
        <Route path="file-manager" element={<FileManagerDisplay />}></Route>
        <Route path="sample-manager" element={<SampleManagerDisplay />}></Route>
        <Route path="track-manager" element={<SampleEditorDisplay />}></Route>
        <Route path="sound-manager-old" element={<SoundManagerOldDisplay />}> </Route>
        <Route path="sketchpad-xtractor" element={<XtractorDisplay />}></Route>
        <Route path="song-export" element={<SongExportDisplay />}></Route>
        <Route path='*' element={<NotFound />}></Route>
     </Route>    
    ),
    {
        basename: "/", // This ensures it always starts with `/#/`
      }
  )

function App(){    

    // socket pull msg later with click...
    // useEffect(() => {                             
    //     const socket = io();
    //     // Listen for messages from the server
    //     socket.on("fifoChanged", (msg) => {            
    //         toast(msg);
    //     });  
        
    //     return ()=>{
    //         socket.off("fifoChanged")
    //     }
    //   },[])

    return (
        <DndProvider backend={HTML5Backend}>
        <RouterProvider router={router} />
        {/* <ToastContainer /> */}
        </DndProvider>
    )
}

const root = ReactDOM.createRoot(document.getElementById('metaheader-container'));
root.render(<App />);