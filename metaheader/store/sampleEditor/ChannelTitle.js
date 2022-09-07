import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from "react-redux";
import { BiUndo } from 'react-icons/bi'
import { useOnClickOutside } from '../../src/app/helpers';
import { updateChannelTitle } from './sampleEditorSlice';

const ChannelTitle = ({ showEditMode, setShowEditMode, title, index }) => {

    const dispatch = useDispatch()

    const [ previousTitle, setPreviousTitle ] = useState(title)

    const undoChangesRef = useRef(null)
    const saveChangesRef = useRef(null)

    useEffect(() => {
        window.removeEventListener('keydown',handleKeyPress,false)
        window.addEventListener('keydown',handleKeyPress,false);
        return () => {
            window.removeEventListener('keydown',handleKeyPress,false)
        }
    },[title])

    function handleKeyPress(e){
        // console.log(e.key);
        if (e.key === "Escape"){
            undoChangesRef.current.click()
        } else if (e.key === "Enter"){
            saveChangesRef.current.click()
        }
    }

    useEffect(() => {
        // console.log('on show edit mode change - ' + showEditMode)
        if (showEditMode === true){
            setPreviousTitle(title)
            // window.addEventListener('keypress',onKeyPress)
        } else if (showEditMode === false){
            // window.removeEventListener('keypress',onKeyPress)
        }
    },[showEditMode])

    function undoTitleChanges(){
        dispatch(updateChannelTitle({index,title:previousTitle}))
        // dispatch(updateChannel({
        //     channelIndex:index,
        //     updateValue:{title:previousTitle}
        // }))
        setShowEditMode(false)
    }

    function saveTitleChanges(){
        setPreviousTitle(title)
        setShowEditMode(false)   
    }

    const ref = useRef();
    useOnClickOutside(ref, e => {
        if (e.target.className !== "edit-button")  setShowEditMode(false)
    });

    const displayedTitle = title === null ? `Track ${index+1}` : title

    let titleDisplay;
    if (showEditMode === true){
        titleDisplay = (
            <div className='input-wrapper'>
                <input type="text" placeholder={""} value={title} onChange={e =>dispatch(updateChannelTitle({index,title:e.target.value})) } autoFocus />
                <a ref={undoChangesRef} className='undo-title-change' onClick={undoTitleChanges}>
                    <BiUndo/>
                </a>
                <a ref={saveChangesRef} className='save-changes' onClick={() => saveTitleChanges()}></a>
            </div>
        )
    } else {
        titleDisplay = <h2>{displayedTitle}</h2>;
    }

    return (
        <div className="sample-set-title">
            <div ref={ref} className='title-wrapper'>
                {titleDisplay}
            </div>
        </div>
    )
}

export default ChannelTitle