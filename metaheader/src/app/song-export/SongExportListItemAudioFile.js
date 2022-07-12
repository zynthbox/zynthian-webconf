import React from 'react'
import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time

const SongExportListItemAudioFile = ({item,itemClassName,onItemClick}) => {

    function handleDragStart(e,data){
        console.log('ON START')
        console.log(e, data)
    }

    function handleDrag(e, data){
        console.log('HANDLE DRAG')
        console.log(e, data)
    }

    function handleDragStop(e, data){
        console.log('HANDLE DRAG STOP')
        console.log(e, data)
    }

    return (
        <Draggable
            onStart={handleDragStart}
            onDrag={handleDrag}
            onStop={handleDragStop}>
            <a className={itemClassName} onClick={() => onItemClick()}>
                <span>{item.name}</span>
                <small>{item.size} | {item.modDate}</small>
                <br/>
                <small>{item.path}</small>
            </a>
        </Draggable>    
    )
}

export default SongExportListItemAudioFile