import React from 'react';
import { useDrop } from 'react-dnd';

const DropTargetZone = React.memo(({onDrop,acceptType,extradata}) => {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: acceptType, // Accept the same type as defined in DraggableItem
    drop: (item, monitor) => {
      onDrop(item,extradata);
      // console.log('Dropped item:', item);
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
        height: '200px',
        width: '300px',
        border: '2px dashed gray',
        backgroundColor: isOver ? 'lightgreen' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isOver ? 'Release to drop' : 'Drag an item here'}
    </div>
  );
})

export default DropTargetZone;
