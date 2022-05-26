import React, { useState, useEffect } from 'react';

function PatternEditor(props){

    const letters = ["a","b","c","d","e","f","g","h","i","j"]
    const  { trackIndex } = props;
    const [ patterns, setPatterns ] = useState([]);

    useEffect(() => {
        getTrackPatterns();
    },[])

    function getTrackPatterns(i,patternsArray){
        let index = i ? i : 0;

        const newPatterns = patternsArray ? [...patternsArray] : []
        const letter = letters[trackIndex];
        const patternPath = `/home/pi/zynthian-my-data/sketches/my-sketches/temp/sequences/scene-${letter}/patterns/scene-${letter}-${index + 1}.pattern.json`

        fetch(`http://${window.location.hostname}:3000/json/${patternPath.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).catch(function(error) {
            console.log(error,"error");
        }).then(async function(res){
            // console.log(res,"res on fetch pattern path")
            if (res.status === 500){
                console.log('ERROR')
            } else {
                const pattern = await res.json()
                if (pattern && pattern.hasNotes === true){
                    pattern.name = `scene-${letter}-${index}`
                    console.log(JSON.parse(pattern.notes))
                    newPatterns.push(pattern)
                }
            }
            if ((index + 1) >= 10){
                setPatterns(newPatterns)
            } else {
                getTrackPatterns(index + 1,newPatterns)
            }
        })
    }


    return (
        <div id="pattern-editor-container">

        </div>
    )
}

export default PatternEditor;