import React, { useState, useEffect } from 'react';

function SketchPadXtractor(props){

    const { colorsArray } = props

    const initSketchFolder = {path:"sketches/my-sketches/temp/"}

    const [ folders, setFolders ] = useState([initSketchFolder])
    const [ selectedSketchFolder, setSelectedSketchFolder ] = useState(null)
    
    const [ sketchVersions, setSketchVersions ] = useState(null)
    const [ selectedSketchVersion, setSelectedSketchVersion ] = useState(null)

    const [ isGeneratingItemGroups, setIsGeneratingItemGroups ] = useState(false);
    const [ itemGroupsGenerationIndex, setItemGroupsGenerationIndex ] = useState(0);

    const [ sketchItemGroups, setSketchItemGroups ] = useState(null)
    console.log(sketchItemGroups,"sketch item groups")
    const [ selectedSketchItemGroup, setSelectedSketchItemGroup ] = useState(null)

    const [ sketchItemGroupItems, setSketchItemGroupItems ] = useState(null)
    const [ selectedSketchItemGroupItem, setSelectedSketchItemGroupItem ] = useState(null)

    useEffect(() => {
        if (selectedSketchFolder !== null){
            getSketchVersions()
        }
    },[selectedSketchFolder])

    useEffect(() => {
        if (selectedSketchVersion !== null){
            getSketch()
            setSketchItemGroups(null)
            setSketchItemGroupItems(null)
        }
    },[selectedSketchVersion])

    async function getSketchVersions(){

        const folderPath = selectedSketchFolder.path.split('/').join('+++');
        const response = await fetch(`http://${window.location.hostname}:3000/mydata/${folderPath}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();
        
        let newSketchVersions = [];

        res.forEach(function(sv,index){
            if (sv.path.indexOf(selectedSketchFolder.path) > -1){
                if (sv.path.indexOf("sketch.json") > -1) newSketchVersions.push(sv)
            }
        })

        setSketchVersions(newSketchVersions)
    }

    async function getSketch(){
        const response = await fetch(`http://${window.location.hostname}:3000/sketch/${selectedSketchVersion.path.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const sketchJson = await response.json();
        console.log(sketchJson,"get sketch res");
        generateItemGroups(sketchJson)
        // setCurrentSketch(res)    
    }

    async function generateItemGroups(sketchJson){

        const newItemGroups = {
            clips:[],
            samples:[],
            sounds:[],
            patterns:[]
        }
        const letters = ["a","b","c","d","e","f","g","h","i","j"]
        const emptyPatternNotesLength = 25283;

        sketchJson.tracks.forEach(async function(track,index){

            // if (index + 1 === sketchJson.tracks.length) setSketchItemGroups(newItemGroups)

            track.clips.forEach(async function(clip,cIndex){
                
                // clips
                if (clip.path !== null) newItemGroups.clips.push(clip)

                // patterns

                const patternPath = `/home/pi/zynthian-my-data/${selectedSketchFolder.path}sequences/scene-${letters[index]}/patterns/scene-${letters[index]}-${cIndex}.pattern.json`

                const patternResponse = await fetch(`http://${window.location.hostname}:3000/json/${patternPath.split('/').join('+++')}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const pattern = await patternResponse.json();
                if (pattern.notes.length !== emptyPatternNotesLength){
                    newItemGroups.patterns.push(pattern)
                }
            })

            // samples

            const samplesResponse = await fetch(`http://${window.location.hostname}:3000/track/${index+1}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const samples = await samplesResponse.json();
            
            samples.forEach(function(sample,sIndex){
                if (sample !== null) newItemGroups.samples.push(sample)
            })

            // sounds
            console.log(index + 1,sketchJson.tracks.length)
            setSketchItemGroups(newItemGroups)
        })
    }

    let sketchVersionColumnDisplay;
    if (sketchVersions !== null){
        sketchVersionColumnDisplay = (
            <SketchPadXtractorColumn 
                type="versions"
                items={sketchVersions}
                onSelectItem={setSelectedSketchVersion}
                color={colorsArray[1]}
            />            
        )
    }

    let sketchItemGroupColumnDisplay;
    if (sketchItemGroups !== null){
        sketchItemGroupColumnDisplay = (
            <SketchPadXtractorColumn 
                type={"item groups"}
                items={sketchItemGroups}
                onSelectItem={setSketchItemGroupItems}
                color={colorsArray[2]}
             />
        )
    }

    let sketchItemGroupItemsColumnDisplay;
    if (sketchItemGroupItems !== null){
        sketchItemGroupItemsColumnDisplay = (
            <SketchPadXtractorColumn 
                type={"items"}
                items={sketchItemGroupItems}
                onSelectItem={setSelectedSketchItemGroupItem}
                color={colorsArray[3]}
             />
        )
    }

    return (
        <div id="sketch-pad-xtractor">
            <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[0]}}>
                <h4>Folders</h4>
                <SketchPadXtractorColumn 
                    type="folders"
                    items={folders}
                    onSelectItem={setSelectedSketchFolder}
                    color={colorsArray[0]}
                />
            </div>
            <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[1]}}>
                <h4>Versions</h4>
                {sketchVersionColumnDisplay}
            </div>
            <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[2]}}>
                <h4>Item Groups</h4>
                {sketchItemGroupColumnDisplay}
            </div>
            <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[3]}}>
                <h4>Items</h4>
                {sketchItemGroupItemsColumnDisplay}
            </div>
            <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[4]}}>
                
            </div>
        </div>
    )
}

function SketchPadXtractorColumn(props){

    const { type, items, onSelectItem, color } = props

    let itemsDisplay;
    if (type === "item groups"){
        itemsDisplay = (
            <React.Fragment>
                <li><a onClick={() => onSelectItem(items.clips,"clips")}>Clips ({items.clips !== null ? items.clips.length: 0})</a></li>
                <li><a onClick={() => onSelectItem(items.samples,"samples")}>Samples ({items.samples !== null ? items.samples.length: 0})</a></li>
                <li><a onClick={() => onSelectItem(items.patterns,"patterns")}>Patterns ({items.patterns !== null ? items.patterns.length: 0})</a></li>
                <li><a onClick={() => onSelectItem(items.sounds,"sounds")}>Sounds ({items.sounds !== null ? items.sounds.length: 0})</a></li>
            </React.Fragment>
        )
    } else {
        itemsDisplay = items.map((item,index) => (
            <li key={index}>
                <a onClick={() => onSelectItem(item)}>{item.path ? item.path : `item ${index + 1}`}</a>
            </li>
        ))
    }

    return (
        <React.Fragment>
            <ul>
                {itemsDisplay}
            </ul>
        </React.Fragment>
    )
}



export default SketchPadXtractor;