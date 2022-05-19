import React from 'react'

export default function LoadingSpinner(props){
    let loadingTextDisplay;
    if (props.text){
        loadingTextDisplay = (
            <div className='lds-grid-text-container'>
                <span>{props.text}</span>
                <br/>
            </div>
        )
    }
    return (
        <React.Fragment>
        <div className='lds-grid-container'>
            <div className="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
        {loadingTextDisplay}
        </React.Fragment>
    )
}