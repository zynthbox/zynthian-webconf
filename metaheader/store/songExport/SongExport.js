import React, { useEffect} from 'react'
import { getSketches, getSongExports, getExportParts, dismissError } from './songExportSlice';
import { useDispatch, useSelector } from 'react-redux'
import ListItem from './ListItem';
import { FaMusic, FaFileExport, FaFileAudio } from 'react-icons/fa'
import LoaderSvg from '../../styles/images/loader.svg'

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

    const {error, sketches, selectedSong, exports, selectedExport, parts, selectedPart, status } = useSelector(state => state.songExport)


    useEffect(() => {
        dispatch(getSketches());
    }, [])

    useEffect(() => {
        if (selectedSong !== null) dispatch(getSongExports(selectedSong.path+"/"))
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

    const sketchesDisplay = sketches.map((song,index) => (
            <ListItem
                key={Date.now() + index}
                item={song} 
                type="song"
            />
    ))

    const exportsDisplay = exports.map((songExport,index)=>(
        <ListItem
            key={Date.now() + index}
            item={songExport} 
            type="songExport"
        />
    ))

    let partsDisplay;
    if (status.parts === "loading" || status.parts === "failed"){
        partsDisplay = (
            <div className='status-display'>
                {status.parts === "loading" ? <img src={LoaderSvg}/> : status.parts}
            </div>
        )
    } else {
        partsDisplay  = parts.map((part,index)=>(
            <ListItem
                key={Date.now() + index}
                item={part} 
                type="part"
            />
        ))
    }

    return (
        <div id="song-export">
            {errorDisplay}
            <div className='song-export-column' id='song-list' style={{backgroundColor:colorsArray[0]}}>
                <div className='column-header'>
                    
                    <h4><FaMusic/>Sketches</h4>
                </div>
                <ul>{sketchesDisplay}</ul>
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


export default SongExport