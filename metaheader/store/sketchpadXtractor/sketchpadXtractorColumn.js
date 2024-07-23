import React, { useState, useEffect } from 'react';
import { usePrevious } from '../../src/app/helpers';
import { useDispatch, useSelector } from "react-redux";

function SketchPadXtractorColumn(props){

    const { type, subType, items, item, letters } = props
    const { itemGroupTypes } = useSelector(state => state.sketchpadXtractor)
    const previousItems = usePrevious(items)
    const [ selectedItemIndex, setSelectedItemIndex ] = useState(null)

    // console.log(items,"items");

    useEffect(() => {
        return () => {
            setSelectedItemIndex(null)
        }
    },[])

    useEffect(() => {
        if (items !== previousItems) setSelectedItemIndex(null)
    },[items])

    function onSelectItem(item,index){
        setSelectedItemIndex(index)
        props.onSelectItem(item)
    }

    let itemsDisplay;
    if (type === "scenes"){
        itemsDisplay = letters.map((scene,index) => (
            <li key={index}><a className={item === scene ? "active" : ""} onClick={() => onSelectItem(scene)}>Scene {scene.toUpperCase()}</a></li>
        ))
    } else if (type === "item groups"){
        itemsDisplay = (
            <React.Fragment>
                {itemGroupTypes.map((igt,index)=>(
                    <li><a className={subType === igt ? "active" : ""} onClick={() => onSelectItem(igt)}>{igt.toUpperCase()} ({items[igt] !== null ? items[igt].length: 0})</a></li>
                ))}
            </React.Fragment>
        )
    } 
    else if (type === "item"){

        if (subType === "patterns"){

            itemsDisplay = (
                <li>
                    <ul>
                        <li><a>Active Bar: {item.activeBar}</a></li>
                        <li><a>Available Bar: {item.availableBars}</a></li>
                        <li><a>Bank Length: {item.bankLength}</a></li>
                        <li><a>Enabled: {item.enabled === true ? "true" : "false"}</a></li>
                        <li><a>Start Note: {item.gridModelStartNote}</a></li>
                        <li><a>End Note: {item.gridModelEndNote}</a></li>
                        <li><a>Midi Channel: {item.midiChannel}</a></li>
                        <li><a>Note Length: {item.noteLength}</a></li>
                    </ul>
                </li>
            )
        }

    }
    else {          
        if(typeof items !== 'undefined' && items){
            itemsDisplay = items.map((item,index) => {

                let itemTextDisplay = item.path ? item.path : `item ${index + 1}`;

                if (type === "versions"){               
                    const fileName = item.path.split('/')[item.path.split('/').length - 1];
                    const folderName = item.path.split(fileName)[0];
                    itemTextDisplay = (
                        <React.Fragment>
                            <span>{fileName}</span>
                            <small>{folderName}</small>
                        </React.Fragment>
                    )
                } else if (type === "items"){

                    itemTextDisplay = item.path ? item.path : `${subType.substring(0,subType.length - 1)} ${index + 1}`;

                    if (subType === "clips"){
                        itemTextDisplay = (
                            <React.Fragment>
                                <span>{item.path}</span>
                                <small>Track: {item.track + 1}</small>
                            </React.Fragment>
                        )                
                    } else if (subType === "samples"){
                        itemTextDisplay = (
                            <React.Fragment>
                                <span>{item.path}</span>
                                <small>Channel: {item.channel + 1} | Slot: {item.slot + 1}</small>
                            </React.Fragment>
                        )         
                    }
                    else if (subType === "sounds"){
                        itemTextDisplay = (
                            <React.Fragment>
                                <span>{item.preset_name}</span>
                                <small>{item.engine_name}</small>
                            </React.Fragment>
                        )
                    } else if (subType === "patterns"){
                        itemTextDisplay = (
                            <React.Fragment>
                                <span>{item.name}</span>
                                <span className='right'>Bars: <b>{item.bankLength}</b></span>
                                
                            </React.Fragment>
                        )
                    }
                }
                
                return (
                    <li key={index}>
                        <a className={selectedItemIndex === index ? "active" : ""} onClick={() => onSelectItem(item,index)}>{itemTextDisplay}</a>
                    </li>
                )
            })
        }    
    }

    return (
        <React.Fragment>
            <div className='xtractor-column-container'>
                <ul>
                    {itemsDisplay}
                </ul>
            </div>
        </React.Fragment>
    )
}


export default SketchPadXtractorColumn