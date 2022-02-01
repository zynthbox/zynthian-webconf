import React, { useState } from 'react';

function MetaHeader(){

    return (
        <nav id="webconf-metaheader">
            HELLO IM METAHEADER
            <FileBrowser/>
        </nav>
    )
}

ReactDOM.render(<MetaHeader />, document.getElementById('metaheader-container'));