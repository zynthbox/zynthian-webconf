import React, { useState, useRef } from 'react'
import { SketchPicker } from 'react-color';
import { AiOutlineBgColors } from 'react-icons/ai'
import { MdEditNote } from 'react-icons/md'
import { useOnClickOutside } from '../../src/app/helpers';
import SampleSet from './SampleSet';
import ChannelSampleModesMenus from './ChannelSampleModesMenu';
import ChannelTitle from './ChannelTitle';
import { updateChannelColor } from './sampleEditorSlice';
import { useDispatch } from "react-redux";

const Channel = (props) => {

    const dispatch = useDispatch()
    const { index, channel, color } = props;
    const [ showEditMode, setShowEditMode ] = useState(false);
    const [ showColorPicker, setShowColorPicker ] = useState(false);

    const ref = useRef();
    useOnClickOutside(ref, () => setShowColorPicker(false));

    let colorPickerDisplay;
    if (showColorPicker === true){
        colorPickerDisplay = (
            <div className="color-picker-container">
                <SketchPicker 
                    color={color}
                    onChange={ color => dispatch(updateChannelColor({index,color:color.hex})) }
                />
            </div>
        )
    }

    // <li>
    //     <a className="track-pattern-editor" onClick={() => props.onShowPatternEditor(index)}>
    //         <BiGridVertical/>
    //     </a>
    // </li>

    return (
        <React.Fragment>
                <div className="sample-set" style={{backgroundColor:props.color}}>
                    <div ref={ref} className="edit-menu-container">
                        <ul className="edit-menu">
                            <li>
                                <a className="edit-button" onClick={() => setShowEditMode(showEditMode == true ? false : true)}>
                                    <MdEditNote />
                                    <span className="edit-button" ></span>
                                </a>
                            </li>
                            <li>
                                <a className="color-picker" onClick={() => setShowColorPicker(showColorPicker == true ? false : true)}>
                                    <AiOutlineBgColors/>
                                </a>
                            </li>
                        </ul>
                        {colorPickerDisplay}
                    </div>
                    <ChannelTitle
                        showEditMode={showEditMode}
                        title={channel.name}
                        index={index}
                        setShowEditMode={setShowEditMode}
                    />
                    <ChannelSampleModesMenus 
                        index={index}
                        keyZoneMode={channel.keyzone_mode}
                        trackType={channel.trackType}
                    />
                    <SampleSet 
                        index={index}
                        samples={channel.trackType === "sample-loop" ? channel.clips : channel.samples}
                        sampleSetMode={channel.trackType}
                        keyZoneMode={channel.keyzone_mode}
                    />
                </div>
        </React.Fragment>
    )
}

export default Channel;