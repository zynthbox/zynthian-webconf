import React from 'react'

const ErrorModal = ({error, onDismiss}) => {

    console.log(typeof error.message)

    return (
        <div id="error-modal">
            <h3>{error.type}</h3>
            <p>
                {error.message}
            </p>
            <div>
                <a onClick={onDismiss} className='error-modal-dismiss'>
                    OK
                </a>
            </div>
        </div>
    )
}

export default ErrorModal;
