import React, { useState, useEffect, useRef } from 'react'
import randomColor from "randomcolor";
import { SketchPicker } from 'react-color';

const SampleEditor = () => {
    return (
        <div id="sample-editor">
            <SampleSet index={0}/>
            <SampleSet index={1}/>
            <SampleSet index={2}/>
            <SampleSet index={3}/>
            <SampleSet index={4}/>
            <SampleSet index={5}/>
            <SampleSet index={6}/>
            <SampleSet index={7}/>
            <SampleSet index={8}/>
            <SampleSet index={9}/>
        </div>
    )
}

const SampleSet = (props) => {

    const { index } = props;

    const [ showEditMode, setShowEditMode ] = useState(false);
    const [ showColorPicker, setShowColorPicker ] = useState(false);
    const [ title, setTitle ] = useState(`Track Title ${index + 1}`);
    const [ color, setColor ] = useState(randomColor())

    const ref = useRef();
    useOnClickOutside(ref, () => setShowColorPicker(false));

    const handleColorPickerChange = (color) => {
        setColor(color.hex)
    }

    const samplesArray = [{
        title:`sample ${index + 1}-1`,
        url:'URL'
    },{
        title:`sample ${index + 1}-2`,
        url:'URL'
    },{
        title:`sample ${index + 1}-3`,
        url:'URL'
    },{
        title:`sample ${index + 1}-4`,
        url:'URL'
    },{
        title:`sample ${index + 1}-5`,
        url:'URL'
    }]

    let titleDisplay;
    if (showEditMode === true){
        titleDisplay = (
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
        )
    } else {
        titleDisplay = title;
    }

    let colorPickerDisplay;
    if (showColorPicker === true){
        colorPickerDisplay = (
            <div ref={ref} className="color-picker-container">
                <SketchPicker 
                    color={color}
                    onChange={ handleColorPickerChange }
                />
            </div>
        )
    }

    const samplesDisplay = samplesArray.map((sample,i) => (
        <Sample key={i} sampleSetIndex={index} index={i} sample={sample} />
    ))

    return (
        <div className="sample-set" style={{backgroundColor:color}}>
            {colorPickerDisplay}
            <h2>{titleDisplay}</h2>
            <ul className="edit-menu">
                <li>
                    <a className="edit-button" onClick={() => setShowEditMode(showEditMode == true ? false : true)}>
                        <i className="glyphicon glyphicon-pencil"></i>
                    </a>
                </li>
                <li>|</li>
                <li>
                    <a className="color-picker" onClick={() => setShowColorPicker(showColorPicker == true ? false : true)}>
                        Color
                    </a>
                </li>
            </ul>
            <ul className="sample-list">
                {samplesDisplay}
            </ul>
        </div>
    )
}

const Sample = (props) => {

    const { index, sample, sampleSetIndex } = props

    return (
        <li id={`sample-${sampleSetIndex + 1}-${index + 1}`}>
            <i className='glyphicon glyphicon-play-circle'></i>
            <h4>{sample.title}</h4>
        </li>
    )
}

// Hook
function useOnClickOutside(ref, handler) {
    useEffect(
      () => {
        const listener = (event) => {
          // Do nothing if clicking ref's element or descendent elements
          if (!ref.current || ref.current.contains(event.target)) {
            return;
          }
          handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
          document.removeEventListener("mousedown", listener);
          document.removeEventListener("touchstart", listener);
        };
      },
      // Add ref and handler to effect dependencies
      // It's worth noting that because passed in handler is a new ...
      // ... function on every render that will cause this effect ...
      // ... callback/cleanup to run every render. It's not a big deal ...
      // ... but to optimize you can wrap handler in useCallback before ...
      // ... passing it into this hook.
      [ref, handler]
    );
  }

export default SampleEditor