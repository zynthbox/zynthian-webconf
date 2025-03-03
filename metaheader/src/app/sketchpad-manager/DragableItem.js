// DraggableItem.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { AiOutlineDrag } from "react-icons/ai";
const DRAG_TYPE_SOUND = 'DRAG_TYPE_SOUND'
function DraggableItem({ id }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: DRAG_TYPE_SOUND, // Define a drag type
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
  }));

  return (
    <span
      ref={dragRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '2px 3px',
        backgroundColor: 'lightblue',
        cursor: 'move',
        width: 'fit-content',
        margin:'3px'
      }}
    >
      <AiOutlineDrag />
      {/* Drag Me (ID: {id}) */}
    </span>
  );
}

export default DraggableItem;
