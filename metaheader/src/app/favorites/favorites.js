import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { RiDeleteBin2Fill } from 'react-icons/ri'

const getFavListTemplateArray = (currentLists) => {
  
  const favoriteListsArray = [{
      title:'Drums/Perc',
      items:[]
  },{
      title:'Bass',
      items:[]
  },{
      title:'Leads (Mono)',
      items:[]
  },{
      title:'Keys (Poly)',
      items:[]
  },{
      title:'Pads/Strings',
      items:[]
  },{
      title:'FX/Other',
      items:[]
  }]

  if (currentLists){
    favoriteListsArray.forEach(function(cl,index){
      cl.items = currentLists[index].items;
    })
  }
  
  return favoriteListsArray;
}

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */

const move = (source, destination, droppableSource, droppableDestination) => {
  
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
  background: isDragging ? "lightgreen" : "#fefefe",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "",
  padding: grid,
  width:'100%'
});

function Favorites(props) {

  const { colorsArray } = props;

  const [state, setState] = useState(null);

  useEffect(() => {
    getFavoritesJson()
  },[])

  async function getFavoritesJson(filter){

    const response = await fetch(`http://${window.location.hostname}:3000/favorites/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const res = await response.json();

    let presetsArray = [];
    res.forEach(function(jf,index){
      for (var i in jf.json){
        var subArray = jf.json[i];
        for (var ii in subArray){
          presetsArray.push(subArray[ii])
        }
      }
    })

    updateState(presetsArray)
  }

  function updateState(presetsArray, listIndex){
    let newState = getFavListTemplateArray(state)
    let updatedListIndex = newState.length - 1;
    if (listIndex) updatedListIndex = listIndex;
    newState[updatedListIndex].items = presetsArray;
    setState(newState);
  }

  function onDragEnd(result) {

    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    let newState;

    if (sInd === dInd) {
      const items = reorder(state[sInd].items, source.index, destination.index);
      newState = getFavListTemplateArray(state)
      newState[sInd] = {
        title:state[sInd].title,
        items:items
      }
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      newState = getFavListTemplateArray(state)
      newState[sInd].items = result[sInd];
      newState[dInd].items = result[dInd];
    }
    setState(newState);
  }
  
  let favColumnsDisplay;
  if (state !== null){
    favColumnsDisplay = state.map((el, ind) => (
      <FavColumn el={el} ind={ind} state={state} color={colorsArray[ind]} setState={setState}/>
    ))
  }

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
    // console.log(props,"props of item");
    const { item, ind, index, state, setState} = props;

    const draggableId = index + "-" + ind;

    let itemContent = item[2]

    return (
        <Draggable
            key={draggableId}
            draggableId={draggableId}
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
            <div className="fav-list-item">
              {itemContent}
            </div>
          </div>
        )}
      </Draggable>   
    )
}


    // <button
    // type="button"
    // onClick={() => {
    //   const newState = [...state];
    //   newState[ind].items.splice(index, 1);
    //   setState(
    //     newState.filter(group => group.items.length)
    //   );
    // }}
    // >
    // <RiDeleteBin2Fill/>
    // </button>

export default Favorites;