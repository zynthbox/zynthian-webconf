import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import FileManager from './app/file-manager';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';

function MetaHeader(){

    const [ showFileManager, setShowFileManager ] = useState(false)

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
        )
    }

    return (
        <React.Fragment>
            <a className={showFileManager === true ? "active" : ""} style={{cursor:"pointer"}} onClick={() => setShowFileManager(showFileManager === true ? false : true)}>Files</a>
            {fileManagerDisplay}
        </React.Fragment>
    )
}

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const e = React.createElement;
const domContainer = document.querySelector('#file-manager-container');
ReactDOM.render(e(MetaHeader), domContainer);