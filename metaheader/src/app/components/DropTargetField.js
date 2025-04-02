import React, { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
const acceptTypes = ['FILE','SKETCHPAD','SAMPLE','SKETCH','SOUND','PATTERN','SOUNDS','SAMPLES','PATTERNS','SKETCHES','TRACKS','SONGS']
const DropTargetField = ({onDrop,extraInfo,accept,width=90, height=25, children}) => {
  const [droppedText, setDroppedText] = useState(null);
 
  useEffect(() => {
    setDroppedText(null)
  }, [extraInfo]);

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: acceptTypes, // Accept the same type as defined in DraggableItem
    drop: (item, monitor) => {
      onDrop(item,extraInfo);
      if(item.type == 'FILE'){
        setDroppedText(item.id.split('/').pop());
      }
      console.log('Dropped item:', item.type);
      // You can also update state or perform other actions here
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }),[extraInfo]);

  return (
    <div
      ref={dropRef}
      style={{
        height: height+'px',
        width: width+'px',
        border: '1px dashed gray',
        backgroundColor: (isOver)? 'lightgreen' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {droppedText || children} 
    </div>
  );
}

export default DropTargetField;
