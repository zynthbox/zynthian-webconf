import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import FileManager from './app/file-manager';
import SampleEditor from './app/sample-editor'
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

    let sampleEditorDisplay;
    if (showSampleEditor === true){
        sampleEditorDisplay = (
            <React.Fragment>
                <div id="sample-editor-container" className="container" style={{left:fileManagerLeftCss}}>
                    <h3>
                        SAMPLE EDITOR
                    </h3>
                    <SampleEditor/>
                </div>
                <div id="sample-editor-overlay"></div>
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
            </ul>
            {fileManagerDisplay}
            {sampleEditorDisplay}
        </React.Fragment>
    )
}

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const e = React.createElement;
const domContainer = document.querySelector('#metaheader-container');
ReactDOM.render(e(MetaHeader), domContainer);