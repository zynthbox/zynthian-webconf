import React, { useState, useEffect } from 'react';
import { usePrevious } from '../helpers'
import { BsFillFolderFill, BsViewList } from 'react-icons/bs'
import { GoVersions } from 'react-icons/go'
import { HiCollection } from 'react-icons/hi'

function SketchPadXtractor(props){

    const { colorsArray } = props

    const initSketchFolder = {path:"sketches/my-sketches/temp/"}
    const letters = ["a","b","c","d","e","f","g","h","i","j"]
    const emptyPatternNotesLength = 25283;
    const itemGroupTypeArray = [
        "clips",
        "patterns",
        "samples",
        "sounds"
    ]

    const [ folders, setFolders ] = useState([initSketchFolder])
    const [ selectedSketchFolder, setSelectedSketchFolder ] = useState(null)
    
    const [ sketchVersions, setSketchVersions ] = useState(null)
    const [ selectedSketchVersion, setSelectedSketchVersion ] = useState(null)
    
    const [ currentSketch, setCurrentSketch ] = useState(null)

    const [ isGeneratingItemGroups, setIsGeneratingItemGroups ] = useState(false);
    const [ itemGroupsGenerationIndex, setItemGroupsGenerationIndex ] = useState(null);
    const [ itemGroupTypeGenerationIndex, setItemGroupTypeGenerationIndex ] = useState(0)
    const previousIGTgenerationIndex = usePrevious(itemGroupTypeGenerationIndex)

    const [ clips, setClips ] = useState(null)
    const [ patterns, setPatterns ] = useState(null)
    const [ samples, setSamples ] = useState(null)
    const [ sounds, setSounds ] = useState(null)
 
    const [ sketchItemGroups, setSketchItemGroups ] = useState(null)
    const [ selectedSketchItemGroup, setSelectedSketchItemGroup ] = useState(null)

    const [ selectedSketchItemGroupItem, setSelectedSketchItemGroupItem ] = useState(null)

    useEffect(() => {
        if (selectedSketchFolder !== null){
            getSketchVersions()
        }
    },[selectedSketchFolder])

    useEffect(() => {
        if (selectedSketchVersion !== null){
            getSketch()
            setClips(null)
            setPatterns(null)
            setSamples(null)
            setSounds(null)
            setSelectedSketchItemGroup(null)
            setSketchItemGroups(null)
        }
    },[selectedSketchVersion])

    useEffect(() => {
        if (currentSketch !== null){
            setIsGeneratingItemGroups(true)
        }
    },[currentSketch])

    useEffect(() => {
        if (isGeneratingItemGroups === true){
            setItemGroupsGenerationIndex(0)
        }
    },[isGeneratingItemGroups])

    useEffect(() => {
        if (itemGroupTypeGenerationIndex !== null){
            if (itemGroupTypeGenerationIndex === 0 && previousIGTgenerationIndex === (itemGroupTypeArray.length - 1)){
                if (itemGroupsGenerationIndex + 1 >= currentSketch.tracks.length){
                    setSketchItemGroups({clips,patterns,samples,sounds})
                    setIsGeneratingItemGroups(false)
                } else {
                    const newIGGIndex = itemGroupsGenerationIndex + 1;
                    setItemGroupsGenerationIndex(newIGGIndex)
                }
            } else {
                if (itemGroupTypeGenerationIndex !== null){
                    generateItemGroups()
                }
            }
        }
    },[itemGroupTypeGenerationIndex])

    useEffect(() => {
        if (itemGroupTypeGenerationIndex !== null){
            generateItemGroups()
        }
    },[itemGroupsGenerationIndex])

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
        const res = await response.json();
        setCurrentSketch(res)    
    }

    async function generateItemGroups(){
    
        if (itemGroupTypeGenerationIndex === 0){
            generateTrackClips()
        } else if (itemGroupTypeGenerationIndex === 1){
            let patternsArray = [];
            if (patterns !== null) patternsArray = [...patterns]
            generateTrackPatterns(0,patternsArray)
        } else if (itemGroupTypeGenerationIndex === 2){
            generateTrackSamples()
        } else if (itemGroupTypeGenerationIndex === 3){
            let soundsArray = [];
            if (sounds !== null) soundsArray = [...sounds]
            generateTrackSounds(soundsArray)
        }

    }

    function generateTrackClips(){
        const track = currentSketch.tracks[itemGroupsGenerationIndex]
        const newClips = clips !== null ? [...clips] : []
        track.clips.forEach(async function(clip,cIndex){
            // clips
            if (clip.path !== null) newClips.push(clip)
        })
        setClips(newClips)
        incrementItemGenerationIndex()
    }

    function generateTrackPatterns(i,patternsArray){
        let index = i ? i : 0;
        const newPatterns = patternsArray ? [...patternsArray] : []
        const letter = letters[itemGroupsGenerationIndex];
        const patternPath = `/home/pi/zynthian-my-data/${selectedSketchFolder.path}sequences/scene-${letter}/patterns/scene-${letter}-${index + 1}.pattern.json`

        fetch(`http://${window.location.hostname}:3000/json/${patternPath.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).catch(function(error) {
            console.log(error,"error");
        }).then(async function(res){
            if (res.status === 500){
                // console.log('ERROR')
            } else {
                const pattern = await res.json()
                if (pattern && pattern.hasNotes === true){
                    newPatterns.push(pattern)
                }
            }
            
            if ((index + 1) >= 10){
                setPatterns(newPatterns)
                incrementItemGenerationIndex()
            } else {
                generateTrackPatterns(index + 1,newPatterns)
            }
        })
    }

    async function generateTrackSamples(){

        const newSamples = samples !== null ? [...samples ] : [];

        fetch(`http://${window.location.hostname}:3000/track/${itemGroupsGenerationIndex+1}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(res){

            if (res.status === 500){
                setSamples(newSamples)
                incrementItemGenerationIndex()
                return;
            }

            const samples = await res.json();
        
            samples.forEach(function(sample,sIndex){
                if (sample !== null) newSamples.push(sample)
            })
        
            setSamples(newSamples)
            incrementItemGenerationIndex()
        })

    }

    function generateTrackSounds(soundsArray){

        const track = currentSketch.tracks[itemGroupsGenerationIndex]
        const newSounds = soundsArray ? [...soundsArray ] : []

        const lastStateZssPath = "/home/pi/zynthian-my-data/snapshots/last_state.zss"
        fetch(`http://${window.location.hostname}:3000/json/${lastStateZssPath.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).catch(function(error) {
            // console.log(error)
        }).then(async function(res){
            
            const lastStateZss = await res.json()

            track.chainedSounds.forEach(function(chainedSound,csIndex){
                if (chainedSound >= 0){
                    lastStateZss.layers.forEach(function(layer,lIndex){
                        if (layer.engine_type === "MIDI Synth" && layer.midi_chan === chainedSound){
                            newSounds.push(layer)
                        }
                    })
                }
            })
            
            setSounds(newSounds)
            incrementItemGenerationIndex()
            

        })

    }

    function incrementItemGenerationIndex(){
        let newIGTGIndex = itemGroupTypeGenerationIndex + 1;
        if (newIGTGIndex === itemGroupTypeArray.length) newIGTGIndex = 0;
        setItemGroupTypeGenerationIndex(newIGTGIndex)
    }

    function onSetSelectedSketchItemGroup(val){
        const iggtIndex = itemGroupTypeArray.findIndex((igt,index) => val === igt);
        setSelectedSketchItemGroup(iggtIndex)
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
                onSelectItem={onSetSelectedSketchItemGroup}
                color={colorsArray[2]}
             />
        )
    }

    let sketchItemGroupItemsColumnDisplay;
    if (selectedSketchItemGroup !== null){
        const items = sketchItemGroups[itemGroupTypeArray[selectedSketchItemGroup]];
        sketchItemGroupItemsColumnDisplay = (
            <SketchPadXtractorColumn 
                type={"items"}
                subType={itemGroupTypeArray[selectedSketchItemGroup]}
                items={items}
                onSelectItem={setSelectedSketchItemGroupItem}
                color={colorsArray[3]}
             />
        )
    }

    let loadingSpinnerDisplay;
    if (isGeneratingItemGroups === true){
        loadingSpinnerDisplay = (
            <div className='loader-container'>
                <div className="lds-ellipsis">
                    <div></div><div></div><div></div><div></div>
                </div>
            </div>
        )
    }

    return (
        <div id="sketch-pad-xtractor">
            <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[0]}}>
                <h4>
                    <BsFillFolderFill/>
                    Folders
                </h4>
                <SketchPadXtractorColumn 
                    type="folders"
                    items={folders}
                    onSelectItem={setSelectedSketchFolder}
                    color={colorsArray[0]}
                />
            </div>
            <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[1]}}>
                <h4>
                    <GoVersions/>
                    Versions
                </h4>
                {sketchVersionColumnDisplay}
            </div>
            <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[2]}}>
                {loadingSpinnerDisplay}
                <h4>
                    <HiCollection />
                    Item Groups
                </h4>
                {sketchItemGroupColumnDisplay}
            </div>
            <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[3]}}>
                <h4>
                    <BsViewList/>
                    Items
                </h4>
                {sketchItemGroupItemsColumnDisplay}
            </div>
            <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[4]}}>
                
            </div>
        </div>
    )
}

function SketchPadXtractorColumn(props){

    const { type, subType, items, onSelectItem } = props

    let itemsDisplay;
    if (type === "item groups"){
        itemsDisplay = (
            <React.Fragment>
                <li><a onClick={() => onSelectItem("clips")}>Clips ({items.clips !== null ? items.clips.length: 0})</a></li>
                <li><a onClick={() => onSelectItem("samples")}>Samples ({items.samples !== null ? items.samples.length: 0})</a></li>
                <li><a onClick={() => onSelectItem("patterns")}>Patterns ({items.patterns !== null ? items.patterns.length: 0})</a></li>
                <li><a onClick={() => onSelectItem("sounds")}>Sounds ({items.sounds !== null ? items.sounds.length: 0})</a></li>
            </React.Fragment>
        )
    } else {
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
            }

            if (subType === "sounds"){
                itemTextDisplay = (
                    <React.Fragment>
                        <span>{item.preset_name}</span>
                        <small>{item.engine_name}</small>
                    </React.Fragment>
                )
            }

            return (
                <li key={index}>
                    <a onClick={() => onSelectItem(item)}>{itemTextDisplay}</a>
                </li>
            )
        })
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