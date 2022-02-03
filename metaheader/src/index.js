import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import MyFileBrowser from './app/file-browser';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';

function MetaHeader(){

    const [ showFileBrowser, setShowFileBrowser ] = useState(false)

    let fileBrowserDisplay;
    if (showFileBrowser === true){
        fileBrowserDisplay = (
            <div id="file-browser-container">
                <a onClick={() => setShowFileBrowser(false)}>X</a>
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
const domContainer = document.querySelector('#metaheader-container');
ReactDOM.render(e(MetaHeader), domContainer);