import React from 'react'
import DraggableItem from './DragableItem'
import SoundEditor from '../sound-manager/SoundEditor'

function SoundList() {
  return (
    
      <div>
        {/* <DraggableItem id="item-1" /> */}
        <SoundEditor isDraggable/>
      </div>
    
  )
}

export default SoundList