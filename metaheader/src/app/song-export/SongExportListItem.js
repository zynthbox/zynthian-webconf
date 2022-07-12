import React from 'react'
import { setSelectedSong, setSelectedExport } from '../../../store/songExport/songExportSlice';
import { useDispatch, useSelector } from 'react-redux'
import SongExportListItemAudioFile from './SongExportListItemAudioFile';

const SongExportListItem = ({item, type}) => {

    const dispatch = useDispatch();

    const { selectedSong, selectedExport } = useSelector(state => state.songExport)

    // CLICK HANDLER
    function onSongExportListItemClick(){
        if (type === "song") dispatch(setSelectedSong(item))
        else if (type === "songExport") dispatch(setSelectedExport(item))
    }

    // CLASSNAME
    let listItemClassName;
    if (type === "song" && selectedSong !== null && selectedSong.path === item.path) listItemClassName = "active";
    else if (type === "songExport" && selectedExport !== null && selectedExport.path === item.path ) listItemClassName = "active";
    
    // CONTENT
    let listItemDisplay = (
        <a className={listItemClassName} onClick={() => onSongExportListItemClick()}>
            <span>{item.folder}</span>
            <small>{item.path}</small>
        </a>
    )
    if (type === "songExport") listItemDisplay = <a className={listItemClassName} onClick={() => onSongExportListItemClick()}><span>{item.name}</span></a>
    if (type === "part") listItemDisplay = <SongExportListItemAudioFile item={item} onItemClick={onSongExportListItemClick} itemClassName={listItemClassName} />

    return (
        <li className='song-export-list-item'>
            {listItemDisplay}
        </li>
    )
}

export default SongExportListItem