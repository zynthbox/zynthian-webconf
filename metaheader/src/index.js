import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import MyFileBrowser from './app/file-browser';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';

function MetaHeader(){

    const [ showFileBrowser, setShowFileBrowser ] = useState(false)

    let fileBrowserDisplay;
    if (showFileBrowser === true){

        let fileBrowserLeftCss = 0;
        const containerElement = document.getElementsByClassName('container')[0];
        if (containerElement !== null){
            console.log(containerElement);
            console.log(window.innerWidth)
            fileBrowserLeftCss = (window.innerWidth - containerElement.width) / 2
        }

        fileBrowserDisplay = (
            <div id="file-browser-container" className="container" style={{left:fileBrowserLeftCss}}>
                <a className="close-file-browser" onClick={() => setShowFileBrowser(false)}>X</a>
                <MyFileBrowser/>
            </div>
        )
    }

    return (
        <React.Fragment>
            <a onClick={() => setShowFileBrowser(showFileBrowser === true ? false : true)}>Files</a>
            {fileBrowserDisplay}
        </React.Fragment>
    )
}

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const e = React.createElement;
const domContainer = document.querySelector('#file-manager-container');
ReactDOM.render(e(MetaHeader), domContainer);