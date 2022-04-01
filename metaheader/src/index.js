import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';

import FileManager from './app/file-manager/file-manager';
import SampleEditor from './app/sample-editor/sample-editor'
import Favorites from './app/favorites/favorites';
import SketchPadXtractor from './app/sketchpad-xtractor/sketchpad-xtractor';

function MetaHeader(){

    const [ showFileManager, setShowFileManager ] = useState(false)
    const [ showSampleEditor, setShowSampleEditor ] = useState(false);
    const [ showFavorites, setShowFavorites ] = useState(false)
    const [ showXtractor, setShowXtractor ] = useState(false)

    useEffect(() => {
        if (showFileManager === true){
            setShowSampleEditor(false)
            setShowFavorites(false)
            setShowXtractor(false)
        }
    },[showFileManager])

    useEffect(() => {
        if (showSampleEditor === true){
            setShowFileManager(false)
            setShowFavorites(false)
            setShowXtractor(false)
        }
    },[showSampleEditor])

    useEffect(() => {
        if (showFavorites === true){
            setShowFileManager(false)
            setShowSampleEditor(false)
            setShowXtractor(false)
        }
    },[showFavorites])

    useEffect(() => {
        if (showXtractor === true){
            setShowFileManager(false)
            setShowSampleEditor(false)
            setShowFavorites(false)
        }
    },[showXtractor])

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
                        FILES
                    </h3>
                    <FileManager/>
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
                        SAMPLE EDITOR
                    </h3>
                    <SampleEditor colorsArray={colorsArray} />
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
                    <Favorites colorsArray={colorsArray} />
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
                    <SketchPadXtractor colorsArray={colorsArray} />
                </div>
                <div id="sketch-pad-xtractor-overlay"></div>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            <a href="#m" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">More <span className="caret"></span></a>
            <ul className="dropdown-menu">
                <li>
                    <a className={showFileManager === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowFileManager(showFileManager === true ? false : true)}>Files</a>
                </li>
                <li>
                    <a className={showSampleEditor === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowSampleEditor(showSampleEditor === true ? false : true)}>Sample-Set Editor</a>
                </li>
                <li>
                    <a className={showFavorites === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowFavorites(showFavorites === true ? false : true)}>Favorites</a>
                </li>
                <li>
                    <a className={showXtractor === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowXtractor(showXtractor === true ? false : true)}>SketchPad Xtractor</a>
                </li>
            </ul>
            {fileManagerDisplay}
            {sampleEditorDisplay}
            {favoritesDisplay}
            {xtractorDisplay}
        </React.Fragment>
    )
}

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const e = React.createElement;
const domContainer = document.querySelector('#metaheader-container');
ReactDOM.render(e(MetaHeader), domContainer);