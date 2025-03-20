import React from 'react';
import { useDrag } from 'react-dnd';

function DraggableItem({ id, type, extraInfo, children}) {
  const [{ isDragging }, dragRef] = useDrag(() => {       
    return ({
    type: type, // Define a drag type
    item: { id,type,extraInfo},
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    })
  }
  ,[id]);


  return (
    <span     
      ref={dragRef}
      type={type}
      id={id}
      style={{
        opacity: isDragging ? 0.5 : 1,      
        cursor: 'move',
        width: 'fit-content',      
      }}
    >          
    {children}
    </span>
  );
}

export default React.memo(DraggableItem);
// export default DraggableItem;
