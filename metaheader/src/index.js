import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import MetaheaderFileBrowser from './app/file-browser';
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';

function MetaHeader(){

    const [ showIFrame, setShowIFrame ] = useState(false)

    let iFrameDisplay;
    if (showIFrame === true){
        iFrameDisplay = (
            <iframe src="https://share.zynthbox.io/browse/"></iframe>
        )
    }

    return (
        <div id="metaheader">
            <a onClick={() => setShowIFrame(showIFrame === true ? false : true)}>Store</a>
            {iFrameDisplay}
        </div>
    )
}

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const e = React.createElement;
const domContainer = document.querySelector('#metaheader-container');
ReactDOM.render(e(MetaHeader), domContainer);