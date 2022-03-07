import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import FileManager from './app/file-manager';
import SampleEditor from './app/sample-editor'
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';

function MetaHeader(){

    const [ showFileManager, setShowFileManager ] = useState(false)
    const [ showSampleEditor, setShowSampleEditor ] = useState(false);

    let fileManagerDisplay;
    if (showFileManager === true){

        let fileManagerLeftCss = 0;
        const containerElement = document.getElementsByClassName('container')[0];
        if (containerElement && containerElement !== null){
            console.log(containerElement);
            console.log(window.innerWidth)
            fileManagerLeftCss = (window.innerWidth - containerElement.offsetWidth) / 2
        }

        fileManagerDisplay = (
            <React.Fragment>
                <div id="file-manager" className="container" style={{left:fileManagerLeftCss}}>
                    <a className="close-file-manager" style={{cursor:"pointer"}} onClick={() => setShowFileManager(false)}>
                        <i className="glyphicon glyphicon-remove-circle"></i>
                    </a>
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
                <div id="sample-editor-container" className="container">
                    <a className="close-sample-editor" style={{cursor:"pointer"}} onClick={() => setShowSampleEditor(false)}>
                        <i className="glyphicon glyphicon-remove-circle"></i>
                    </a>
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
            <a className={showFileManager === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowFileManager(showFileManager === true ? false : true)}>Files</a>
            <a className={showSampleEditor === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowSampleEditor(showSampleEditor === true ? false : true)}>Sample Editor</a>
            {fileManagerDisplay}
            {sampleEditorDisplay}
        </React.Fragment>
    )
}

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const e = React.createElement;
const domContainer = document.querySelector('#metaheader-container');
ReactDOM.render(e(MetaHeader), domContainer);