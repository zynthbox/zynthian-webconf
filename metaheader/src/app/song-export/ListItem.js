import React from 'react'
import { setSelectedSong, setSelectedExport } from '../../../store/songExport/songExportSlice';
import { useDispatch, useSelector } from 'react-redux'
import AudioPlayer from './AudioPlayer';

const ListItem = ({item, type}) => {

    const dispatch = useDispatch();

    const { selectedSong, selectedExport, selectedPart } = useSelector(state => state.songExport)

    // CLICK HANDLER
    function onSongExportListItemClick(){
        if (type === "song") dispatch(setSelectedSong(item))
        else if (type === "songExport") dispatch(setSelectedExport(item))
    }

    // CLASSNAME
    let listItemClassName;
    if (type === "song" && selectedSong !== null && selectedSong.path === item.path || 
        type === "songExport" && selectedExport !== null && selectedExport.path === item.path ||
        type === "part" && selectedPart !== null && selectedPart.path === item.path ) listItemClassName = "active";

    // CONTENT
    let listItemDisplay = <AudioPlayer item={item}/> 
    if (type !== "part"){
        console.log(item)
        const itemName = type === "songExport" ? item.name : item.folder;
        const itemPath = type === "songExport" ? "" : <small>{item.path}</small>;
        listItemDisplay = (
            <React.Fragment>
                <span>{itemName}</span>
                <b className='count'>{item.count}</b>
                {itemPath}
            </React.Fragment>
        )
    }

    return (
        <li className='song-export-list-item'>
            <a className={listItemClassName} onClick={() => onSongExportListItemClick()}>
                {listItemDisplay}
            </a>
        </li>
    )
}

export default ListItem