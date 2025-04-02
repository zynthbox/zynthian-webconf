import React from 'react';
import { useDrop } from 'react-dnd';
const acceptTypes = ['FILE','SKETCHPAD','SAMPLE','SKETCH','SOUND','PATTERN','SOUNDS','SAMPLES','PATTERNS','SKETCHES','TRACKS','SONGS']
const DropTargetZone = ({onDrop,accept,children}) => {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: acceptTypes, // Accept the same type as defined in DraggableItem
    drop: (item, monitor) => {
      onDrop(item);
      console.log('Dropped item:', item.type);
      // You can also update state or perform other actions here
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={dropRef}
      style={{
        height: '150px',
        width: '200px',
        border: '2px dashed gray',
        backgroundColor: isOver ? 'lightgreen' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}     
    </div>
  );
}

export default DropTargetZone;
