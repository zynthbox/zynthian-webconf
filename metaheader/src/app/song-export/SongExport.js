import React, { useEffect} from 'react'
import { Provider } from 'react-redux';
import { store } from '../../../store/store'
import { getSongs, getSongExports, getExportParts, dismissError } from '../../../store/songExport/songExportSlice';
import { useDispatch, useSelector } from 'react-redux'
import SongExportListItem from './SongExportListItem';
import { FaMusic, FaFileExport, FaFileAudio } from 'react-icons/fa'

const SongExportWrapper = () => { 
    return (
        <Provider store={store}>
            <SongExport/>
        </Provider>
    )
}

const colorsArray = [
    "#B23730",
    "#EE514B",
    "#F77535",
    "#F7D635",
    "#FE68B1",
    "#A438FF",
    "#6491FF",
    "#73F6EE",
    "#65E679",
    "#9A7136",
]

const SongExport = (props) => {
        
    const dispatch = useDispatch();

    const {error, songs, selectedSong, exports, selectedExport, parts, selectedPart } = useSelector(state => state.songExport)

    console.log(exports, " EXPORTS ")

    useEffect(() => {
        dispatch(getSongs());
    }, [])

    useEffect(() => {
        if (selectedSong !== null){
            console.log(selectedSong, " SELECTED SONG")
            dispatch(getSongExports(selectedSong.path+"/"))
        }
    },[selectedSong])
    
    useEffect(() => {
        if (selectedExport !== null){
            console.log(selectedExport, " SELECTED EXPORT")
            dispatch(getExportParts(selectedExport.path+"/"))
        }
    },[selectedExport])

    let errorDisplay;
    if (error !== ''){
        errorDisplay = (
            <div className='song-export-error'>
                <span>{error} <a onClick={() => dispatch(dismissError())}>(X)</a></span>
            </div>
        )
    }

    const songsDisplay = songs.map((song,index) => (
            <SongExportListItem
                key={Date.now() + index}
                item={song} 
                type="song"
            />
    ))

    const exportsDisplay = exports.map((songExport,index)=>(
        <SongExportListItem
            key={Date.now() + index}
            item={songExport} 
            type="songExport"
        />
    ))

    const partsDisplay  = parts.map((part,index)=>(
        <SongExportListItem
            key={Date.now() + index}
            item={part} 
            type="part"
        />
    ))

    return (
        <div id="song-export">
            {errorDisplay}
            <div className='song-export-column' id='song-list' style={{backgroundColor:colorsArray[0]}}>
                <div className='column-header'>
                    
                    <h4><FaMusic/>Songs</h4>
                </div>
                <ul>{songsDisplay}</ul>
            </div>
            <div className='song-export-column' id='export-folders-list' style={{backgroundColor:colorsArray[1]}}>
                <div className='column-header'>
                    
                    <h4><FaFileExport/>Exports</h4>
                </div>
                <ul>{exportsDisplay}</ul>
            </div>
            <div className='song-export-column' id='song-parts-list' style={{backgroundColor:colorsArray[2]}}>
                <div className='column-header'>
                    
                    <h4><FaFileAudio/>Parts</h4>
                </div>
                <ul>{partsDisplay}</ul>
            </div>
        </div>
    )
}


export default SongExportWrapper