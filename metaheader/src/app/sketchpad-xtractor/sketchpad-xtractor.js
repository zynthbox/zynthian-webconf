import React, { useState, useEffect } from 'react';
import { usePrevious } from '../helpers'
import SketchPadXtractorColumn from './sketchpad-xtractor-column';
import { BsFillFolderFill, BsViewList } from 'react-icons/bs'
import { GoVersions } from 'react-icons/go'
import { HiCollection } from 'react-icons/hi'
import { GiMagnifyingGlass } from 'react-icons/gi'


function SketchPadXtractor(props){

    const { colorsArray } = props

    const initSketchFolder = {path:"sketches/my-sketches/temp/"}
    const letters = ["a","b","c","d","e","f","g","h","i","j"]
    const emptyPatternNotesLength = 25283;
    const itemGroupTypeArray = [
        "clips",
        "patterns",
        "samples",
        "sounds",
        "tracks",
        "songs"
    ]

    const [ folders, setFolders ] = useState([initSketchFolder])
    const [ selectedSketchFolder, setSelectedSketchFolder ] = useState(null)
    
    const [ sketchVersions, setSketchVersions ] = useState(null)
    const [ selectedSketchVersion, setSelectedSketchVersion ] = useState(null)

    const [ selectedSketchScene, setSelectedSketchScene ] = useState(null)
    
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

    // console.log(selectedSketchItemGroupItem,"selected sketch item group item")

    useEffect(() => {
        if (selectedSketchFolder !== null){
            getSketchVersions()
        }
    },[selectedSketchFolder])

    useEffect(() => {
        if (selectedSketchVersion !== null){
            getSketch()
            setSelectedSketchScene(null)
            setClips(null)
            setPatterns(null)
            setSamples(null)
            setSounds(null)
            setSelectedSketchItemGroup(null)
            setSketchItemGroups(null)
        }
    },[selectedSketchVersion])

    useEffect(() => {
        setClips(null)
        setPatterns(null)
        setSamples(null)
        setSounds(null)
        setSelectedSketchItemGroup(null)
        setSketchItemGroups(null)
    },[selectedSketchScene])

    useEffect(() => {
        if (currentSketch !== null && selectedSketchScene !== null){
            setIsGeneratingItemGroups(true)
        }
    },[currentSketch,selectedSketchScene])

    useEffect(() => {
        if (isGeneratingItemGroups === true){
            setItemGroupsGenerationIndex(0)
        }
    },[isGeneratingItemGroups])

    useEffect(() => {
        if (itemGroupTypeGenerationIndex !== null){

            console.log(itemGroupTypeGenerationIndex,"IGTGI")
            console.log(previousIGTgenerationIndex,"prev igtgi")
            console.log(itemGroupTypeArray.length - 3)

            if (itemGroupTypeGenerationIndex === 0 && previousIGTgenerationIndex === (itemGroupTypeArray.length - 3)){

                console.log('FINISH!!!!!')

                if (itemGroupsGenerationIndex + 1 >= currentSketch.tracks.length){
                    setSketchItemGroups({clips,patterns,samples,sounds,tracks:[0,1,2,3,4,5,6,7,8,9],songs:[0,1,2]})
                    setIsGeneratingItemGroups(false)
                } else {
                    const newIGGIndex = itemGroupsGenerationIndex + 1;
                    setItemGroupsGenerationIndex(newIGGIndex)
                }
            } else {

                console.log('DONT FINISH!!!!!')


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
    
        console.log(itemGroupTypeGenerationIndex)

        if (itemGroupTypeGenerationIndex === 0){
            generateTrackClips()
        } else if (itemGroupTypeGenerationIndex === 1){
            let patternsArray = [];
            if (patterns !== null) patternsArray = [...patterns]
            generateTrackPatterns(0,patternsArray,0)
        } else if (itemGroupTypeGenerationIndex === 2){
            generateTrackSamples()
        } else if (itemGroupTypeGenerationIndex === 3){
            let soundsArray = [];
            if (sounds !== null) soundsArray = [...sounds]
            generateTrackSounds(soundsArray)
        } else {
            console.log('now generate tracks or songs')
            // setItemGroupTypeGenerationIndex(0)
            // setItemGroupTypeGenerationIndex(itemGroupTypeGenerationIndex + 1)
        }

    }

    function generateTrackClips(){
        const track = currentSketch.tracks[itemGroupsGenerationIndex]
        const newClips = clips !== null ? [...clips] : []
        track.clips.forEach(async function(clip,cIndex){
            if (cIndex === letters.findIndex(letter => letter === selectedSketchScene) && clip.path !== null) {
                clip.track = cIndex;
                newClips.push(clip)
            }
        })
        setClips(newClips)
        incrementItemGenerationIndex()
    }

    function generateTrackPatterns(i,patternsArray,partIndex){
        let index = i ? i : 0;
        const newPatterns = patternsArray ? [...patternsArray] : []
        const letter = letters[itemGroupsGenerationIndex];
        const patternPath = `/home/pi/zynthian-my-data/${selectedSketchFolder.path}sequences/scene-${selectedSketchScene}/patterns/scene-${selectedSketchScene}-${itemGroupsGenerationIndex + 1}${letters[partIndex]}.pattern.json`

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
                    pattern.name = `scene-${selectedSketchScene}-${itemGroupsGenerationIndex + 1}${letters[partIndex]}`
                    newPatterns.push(pattern)
                }
            }

            if ((partIndex + 1) >= 5){
                // if ((itemGroupTypeGenerationIndex + 1) >= 10){
                    setPatterns(newPatterns)
                    incrementItemGenerationIndex()
                // }
                // } else {
                //     generateTrackPatterns(index + 1,newPatterns,0)
                // }
            } else {
                generateTrackPatterns(index,newPatterns,partIndex + 1)
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
                if (sample !== null) {
                    sample.track = itemGroupsGenerationIndex;
                    sample.slot = sIndex;
                    newSamples.push(sample)
                }
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
        if (newIGTGIndex === itemGroupTypeArray.length - 2) newIGTGIndex = 0;
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

    let sketchScenesColumnDisplay;
    if (selectedSketchVersion !== null){
        sketchScenesColumnDisplay = (
            <SketchPadXtractorColumn 
                type="scenes"
                onSelectItem={setSelectedSketchScene}
                item={selectedSketchScene}
                color={colorsArray[2]}
                letters={letters}
            />
        )
    }

    let sketchItemGroupColumnDisplay;
    if (sketchItemGroups !== null){
        sketchItemGroupColumnDisplay = (
            <SketchPadXtractorColumn 
                type={"item groups"}
                items={sketchItemGroups}
                subType={itemGroupTypeArray[selectedSketchItemGroup]}
                onSelectItem={onSetSelectedSketchItemGroup}
                color={colorsArray[3]}
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
                color={colorsArray[4]}
             />
        )
    }

    let sketchItemSelectedItemColumnDisplay;
    if (selectedSketchItemGroupItem !== null){



        sketchItemSelectedItemColumnDisplay  = (

            <div className='sketch-pad-xtractor-row'>
                <div style={{backgroundColor:colorsArray[5]}} className={'sketch-pad-xtractor-column full'}>
                    <h4>
                        <GiMagnifyingGlass/>
                        Details
                    </h4>
                    <SketchPadXtractorColumn 
                        type={"item"}
                        subType={itemGroupTypeArray[selectedSketchItemGroup]}
                        item={selectedSketchItemGroupItem}
                        // onSelectItem={setSelectedSketchItemGroupItem}
                        color={colorsArray[5]}
                    />
                </div>
            </div>


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
            <div className='sketch-pad-xtractor-row'>
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
                    <h4>
                        <BsViewList/>
                        Scenes
                    </h4>
                    {sketchScenesColumnDisplay}
                </div>

                <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[3]}}>
                    {loadingSpinnerDisplay}
                    <h4>
                        <HiCollection />
                        Item Groups
                    </h4>
                    {sketchItemGroupColumnDisplay}
                </div>
                <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[4]}}>
                    <h4>
                        <BsViewList/>
                        Items
                    </h4>
                    {sketchItemGroupItemsColumnDisplay}
                </div>
            </div>
            {sketchItemSelectedItemColumnDisplay}
            {/* <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[4]}}>

            </div> */}
        </div>
    )
}




export default SketchPadXtractor;