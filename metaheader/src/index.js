import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store'
import ReactDOM from 'react-dom/client';
import FileManagerContextProvider from './app/file-manager/context/context-provider';

import LoadingSpinner from './app/loading-spinner';

const FileManager = lazy(()=>import('./app/file-manager/file-manager'))
const SketchpadManager = lazy(()=>import('./app/sketchpad-manager/SketchpadManager'))
const SoundManager = lazy(()=>import('./app/sound-manager/SoundManager'))
const SampleManger= lazy(()=>import('./app/sample-manager/SampleManager'))

const SampleEditor = lazy(()=>import('../store/sampleEditor/SampleEditor'))
const Favorites = lazy(()=>import('../store/favorites/favorites'))
const SketchPadXtractor = lazy(()=>import('../store/sketchpadXtractor/SketchpadXtractor')) 
const SongExport = lazy(()=>import('../store/songExport/SongExport'))

function MetaHeader(){

    const [ showFileManager, setShowFileManager ] = useState(false)    
    const [ showSampleEditor, setShowSampleEditor ] = useState(false);
    const [ showFavorites, setShowFavorites ] = useState(false)
    const [ showXtractor, setShowXtractor ] = useState(false)
    const [ showSongExport, setShowSongExport ] = useState(false)

    const [ showSketchManager, setShowSketchManager ] = useState(false)
    const [ showSampleManager, setShowSampleManager ] = useState(false)
    const [ showSoundManager, setShowSoundManager ] = useState(false)

    useEffect(() => {
        if (showFileManager === true){
            setShowSampleEditor(false)
            setShowFavorites(false)
            setShowXtractor(false)
            setShowSongExport(false)

            setShowSketchManager(false)
            setShowSampleManager(false)
            setShowSoundManager(false)
        }
    },[showFileManager])

    useEffect(() => {
        if (showSampleEditor === true){
            setShowFileManager(false)
            setShowFavorites(false)
            setShowXtractor(false)
            setShowSongExport(false)

            setShowSketchManager(false)
            setShowSampleManager(false)
            setShowSoundManager(false)
        }
    },[showSampleEditor])

    useEffect(() => {
        if (showFavorites === true){
            setShowFileManager(false)
            setShowSampleEditor(false)
            setShowXtractor(false)
            setShowSongExport(false)

            setShowSketchManager(false)
            setShowSampleManager(false)
            setShowSoundManager(false)
        }
    },[showFavorites])

    useEffect(() => {
        if (showXtractor === true){
            setShowFileManager(false)
            setShowSampleEditor(false)
            setShowFavorites(false)
            setShowSongExport(false)

            setShowSketchManager(false)
            setShowSampleManager(false)
            setShowSoundManager(false)
        }
    },[showXtractor])

    useEffect(() => {
        if (showSongExport === true){
            setShowFileManager(false)
            setShowSampleEditor(false)
            setShowFavorites(false)
            setShowXtractor(false)

            setShowSketchManager(false)
            setShowSampleManager(false)
            setShowSoundManager(false)
        }
    },[showSongExport])

    useEffect(() => {
        if (showSketchManager === true){
            setShowFileManager(false)
            setShowSampleEditor(false)
            setShowFavorites(false)
            setShowXtractor(false)
            setShowSongExport(false)

            setShowSampleManager(false)
            setShowSoundManager(false)
        }
    },[showSketchManager])


    useEffect(() => {
        if (showSampleManager === true){
            setShowFileManager(false)
            setShowSampleEditor(false)
            setShowFavorites(false)
            setShowXtractor(false)
            setShowSongExport(false)

            setShowSketchManager(false)         
            setShowSoundManager(false)
        }
    },[showSampleManager])

    useEffect(() => {
        if (showSoundManager === true){
            setShowFileManager(false)
            setShowSampleEditor(false)
            setShowFavorites(false)
            setShowXtractor(false)
            setShowSongExport(false)

            setShowSketchManager(false)
            setShowSampleManager(false)
           
        }
    },[showSoundManager])

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
    ]

    let fileManagerDisplay;
    let fileManagerLeftCss = 0;
    const containerElement = document.getElementsByClassName('container')[0];
    if (containerElement && containerElement !== null){
        fileManagerLeftCss = (window.innerWidth - containerElement.offsetWidth) / 2
    }

    if (showFileManager === true){

        fileManagerDisplay = (
            <React.Fragment>
                <div id="file-manager" className="container" style={{left:fileManagerLeftCss}}>
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
            </React.Fragment>
        )
    }

    let sampleEditorDisplay;
    if (showSampleEditor === true){
        sampleEditorDisplay = (
            <React.Fragment>
                <div id="sample-editor-container" className="container" style={{left:fileManagerLeftCss}}>
                    <h3>
                        SAMPLE {'&'} PATTERN EDITOR
                    </h3>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <SampleEditor colorsArray={colorsArray} />
                    </Suspense>
                </div>
                <div id="sample-editor-overlay"></div>
            </React.Fragment>
        )
    }

    let favoritesDisplay;
    if (showFavorites === true){
        favoritesDisplay = (
            <React.Fragment>
                <div id="favorites-container" className="container" style={{left:fileManagerLeftCss}}>
                    <h3>
                        Favorites
                    </h3>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <Favorites colorsArray={colorsArray} /> 
                    </Suspense>
                </div>
                <div id="favorites-overlay"></div>
            </React.Fragment>
        )
    }

    let xtractorDisplay;
    if (showXtractor === true){
        xtractorDisplay = (
            <React.Fragment>
                <div id="sketch-pad-xtractor-container" className="container" style={{left:fileManagerLeftCss}}>
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

    let songExportDisplay;
    if (showSongExport === true){
        songExportDisplay = (
            <React.Fragment>
                <div id="song-export-container" className="container" style={{left:fileManagerLeftCss}}>
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

    let sketchManagerDisplay;
    if (showSketchManager === true){
        sketchManagerDisplay = (
            <>
            <div id="sample-manager-display" className="container" style={{left:fileManagerLeftCss}}>
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

    let soundManagerDisplay;
    if(showSoundManager===true){
        soundManagerDisplay = (
            <>
                    <div id="sound-manager-display" className="container" style={{left:fileManagerLeftCss}}>
                    <h3>
                    <i className="glyphicon glyphicon-file"></i>SOUND MANAGER
                    </h3>
                    <Suspense fallback={<LoadingSpinner/>}>
                        <SoundManager />
                    </Suspense> 
                </div>
            </>
        )
    }

    let sampleManagerDisplay;
    if(showSampleManager===true){
        sampleManagerDisplay = (
            <>
                <div id="sample-manager-display" className="container" style={{left:fileManagerLeftCss}}>
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

    return (
        <Provider store={store}>
            <React.Fragment>
            <a href="#m" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Tools <span className="caret"></span></a>
            <ul className="dropdown-menu">
                <li>
                    <a className={showFileManager === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowFileManager(showFileManager === true ? false : true)}>File Manager</a>
                </li>
                <li>
                    <a className={showSketchManager === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowSketchManager(showSketchManager === true ? false : true)}>Sketchpad Manager</a>
                </li>
                <li>
                    <a className={showSoundManager === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowSoundManager(showSoundManager === true ? false : true)}>Sound Manager</a>
                </li>
                <li>
                    <a className={showSampleManager === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowSampleManager(showSampleManager === true ? false : true)}>Sample Manager</a>
                </li>

                <li>
                    -- OLD --
                </li>
                <li>
                    <a className={showSampleEditor === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowSampleEditor(showSampleEditor === true ? false : true)}>Tracks Manager</a>
                </li>
                <li>
                    <a className={showFavorites === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowFavorites(showFavorites === true ? false : true)}>Favorites</a>
                </li>
                <li>
                    <a className={showXtractor === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowXtractor(showXtractor === true ? false : true)}>SketchPad Xtractor</a>
                </li>
                <li>
                    <a className={showSongExport === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowSongExport(showSongExport === true ? false : true)}>Song Export</a>
                </li>
            </ul>
            {fileManagerDisplay}
            {sketchManagerDisplay}
            {sampleEditorDisplay}
            {favoritesDisplay}
            {xtractorDisplay}
            {songExportDisplay}    
            {soundManagerDisplay}    
            {sampleManagerDisplay}    
        </React.Fragment>
        </Provider>
    )
}

// const e = React.createElement;
// const domContainer = document.querySelector('#metaheader-container');
// ReactDOM.render(e(MetaHeader), domContainer);

const root = ReactDOM.createRoot(document.getElementById('metaheader-container'));
root.render(<MetaHeader/>);