import React from 'react';
import { useDrag } from 'react-dnd';

function DraggableItem({ id, type, extraInfo, children}) {
  const [{ isDragging }, dragRef] = useDrag(() => {
    
    // console.log('>>>>>>>>>>>>useDrag id',id,'type:',type);
    return ({
    type: type, // Define a drag type
    item: { id, type,extraInfo },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    })
}
  ,[id]);
  // const [{ isDragging }, dragRef] = useDrag(() => ({
  //   type: type, // Define a drag type
  //   item: { id, type,extraInfo },
  //   collect: (monitor) => ({
  //     isDragging: monitor.isDragging()
  //   }),
  // }));

  return (
    <span
      ref={dragRef}
      type={type}
      id={id}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '2px 3px',
        // backgroundColor: 'lightblue',
        cursor: 'move',
        width: 'fit-content',
        margin:'3px'
      }}
    >      
     {children}
    </span>
  );
}

export default DraggableItem;
