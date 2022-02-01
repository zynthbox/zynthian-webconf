import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import MetaheaderFileBrowser from './app/file-browser';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';

function MetaHeader(){

    const [ showFileBrowser, setShowFileBrowser ] = useState(false)

    let fileBrowserDisplay;
    if (showFileBrowser === true){
        fileBrowserDisplay = <MetaheaderFileBrowser/>
    }

    return (
        <div id="metaheader">
            <a onClick={() => setShowFileBrowser(showFileBrowser === true ? false : true)}>file browser</a>
            {fileBrowserDisplay}
        </div>
    )
}

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const e = React.createElement;
const domContainer = document.querySelector('#metaheader-container');
ReactDOM.render(e(MetaHeader), domContainer);