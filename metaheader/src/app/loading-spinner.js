import React from 'react'

export default function LoadingSpinner(){
    return (
        <div className='lds-grid-container'>
            <div className="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
    )
}