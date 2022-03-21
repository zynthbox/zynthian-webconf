import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import FileManager from './app/file-manager/file-manager';
import SampleEditor from './app/sample-editor/sample-editor'
import Favorites from './app/favorites/favorites';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';

function MetaHeader(){

    const [ showFileManager, setShowFileManager ] = useState(false)
    const [ showSampleEditor, setShowSampleEditor ] = useState(false);
    const [ showFavorites, setShowFavorites ] = useState(false)

    useEffect(() => {
        if (showFileManager === true){
            setShowSampleEditor(false)
            setShowFavorites(false)
        }
    },[showFileManager])

    useEffect(() => {
        if (showSampleEditor === true){
            setShowFileManager(false)
            setShowFavorites(false)
        }
    },[showSampleEditor])

    useEffect(() => {
        if (showFavorites === true){
            setShowFileManager(false)
            setShowSampleEditor(false)
        }
    },[showFavorites])

    let fileManagerDisplay;
    let fileManagerLeftCss = 0;
    const containerElement = document.getElementsByClassName('container')[0];
    if (containerElement && containerElement !== null){
        console.log(containerElement);
        console.log(window.innerWidth)
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

    return (
        <React.Fragment>
            <a href="#m" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">More <span className="caret"></span></a>
            <ul className="dropdown-menu">
                <li>
                    <a className={showFileManager === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowFileManager(showFileManager === true ? false : true)}>Files</a>
                </li>
                <li>
                    <a className={showSampleEditor === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowSampleEditor(showSampleEditor === true ? false : true)}>Sample Editor</a>
                </li>
                <li>
                    <a className={showFavorites === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowFavorites(showFavorites === true ? false : true)}>Favorites</a>
                </li>
            </ul>
            {fileManagerDisplay}
            {sampleEditorDisplay}
            {favoritesDisplay}
        </React.Fragment>
    )
}

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const e = React.createElement;
const domContainer = document.querySelector('#metaheader-container');
ReactDOM.render(e(MetaHeader), domContainer);