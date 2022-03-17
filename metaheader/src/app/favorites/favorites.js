// import React, { useState, useEffect } from 'react'
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// function Favorites(props){

//     const [ favoriteLists, setFavoriteLists ] = useState(favoriteListsArray)

//     const favoriteListsDisplay = favoriteLists.map((fl,index) => (
//         <div className='fav-column'>
//             <div className='fav-column-header'>
//                 <h4>
//                     {fl.title}
//                 </h4>
//             </div>
//             <div className='fav-column-list'>
//                 <ul>
//                     <li><a>{fl.title} item 1</a></li>
//                     <li><a>{fl.title} item 2</a></li>
//                     <li><a>{fl.title} item 3</a></li>
//                     <li><a>{fl.title} item 4</a></li>
//                     <li><a>{fl.title} item 5</a></li>
//                     <li><a>{fl.title} item 6</a></li>
//                     <li><a>{fl.title} item 7</a></li>
//                 </ul>
//             </div>
//         </div>
//     ))

//     return (
//         <div id="favorites">
//             <div id="fav-grid">
//                 <div className='fav-row'>
//                     {favoriteListsDisplay}
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Favorites;

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`
  }));

const reorder = (list, startIndex, endIndex) => {
  console.log(list,'reorder list')
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  console.log(droppableSource,'droppable source')
  console.log(droppableDestination, 'droppable destination')
  const sourceClone = Array.from(source.items);
  const destClone = Array.from(destination.items);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};
const grid = 4;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle
});
const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width:'100%'
});

function Favorites(props) {

    const { colorsArray } = props;

    const favoriteListsArray = [{
        title:'Drums/Perc',
        items:getItems(10)
    },{
        title:'Bass',
        items:getItems(10,20)
    },{
        title:'Leads (Mono)',
        items:getItems(10,30)
    },{
        title:'Keys (Poly)',
        items:getItems(10,40)
    },{
        title:'Pads/Strings',
        items:getItems(10,50)
    },{
        title:'FX/Other',
        items:getItems(10,60)
    }]

  const [state, setState] = useState(favoriteListsArray);

  function onDragEnd(result) {

    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd].items, source.index, destination.index);
      const newState = [...state];
      newState[sInd] = {
        title:state[sInd].title,
        items:items
      }
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd].items = result[sInd];
      newState[dInd].items = result[dInd];

      setState(newState.filter(group => group.items.length));
    }
  }

  const favColumnsDisplay = state.map((el, ind) => (
    <FavColumn el={el} ind={ind} state={state} color={colorsArray[ind]} setState={setState}/>
  ))

  /* RENDER */
  
  return (
    <div id="favorites">
        <div id="fav-grid">
            <div className="fav-row">
              <DragDropContext onDragEnd={onDragEnd}>
              {favColumnsDisplay}
              </DragDropContext>
            </div>
        </div>
    </div>
  );
}

const FavColumn = (props) => {
    
    const { el, ind, color, state, setState } = props;
    
    return (
    <div className="fav-column"  style={{backgroundColor:color}} >
        <div className="fav-column-header">
            <h4>
                {el.title}
            </h4>
        </div>
        <div className="fav-column-list">
            <Droppable key={ind} droppableId={`${ind}`}>
                {(provided, snapshot) => (
                <div
                    className="fav-column-list-wrapper"
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                >
                    {el.items.map((item, index) => (
                        <FavColumnListItem 
                            item={item}
                            ind={ind}
                            index={index}
                            provided={provided}
                            state={state}
                            setState={setState}
                        />
                    ))}
                    {provided.placeholder}
                </div>
                )}
            </Droppable>
        </div>
    </div>
    )
}

const FavColumnListItem = (props) => {

    const { item, ind, index, state, setState} = props;

    return (
        <Draggable
            key={item.id}
            draggableId={item.id}
            index={index}
        >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-around"
              }}
            >
              {item.content}
              <button
                type="button"
                onClick={() => {
                  const newState = [...state];
                  newState[ind].items.splice(index, 1);
                  setState(
                    newState.filter(group => group.items.length)
                  );
                }}
              >
                delete
              </button>
            </div>
          </div>
        )}
      </Draggable>   
    )
}
export default Favorites;