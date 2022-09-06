import React, { useState, useEffect } from 'react';
import { usePrevious } from '../helpers'
import SketchPadXtractorColumn from './sketchpad-xtractor-column';
import { BsFillFolderFill, BsViewList } from 'react-icons/bs'
import { GoVersions } from 'react-icons/go'
import { HiCollection } from 'react-icons/hi'
import { GiMagnifyingGlass } from 'react-icons/gi'


function SketchPadXtractor(props){

    const { colorsArray } = props

    const initSketchpadFolder = {path:"sketchpads/my-sketchpads/"}
    const letters = ["a","b","c","d","e","f","g","h","i","j"]
    const emptyPatternNotesLength = 25283;
    const itemGroupTypeArray = [
        "clips",
        "patterns",
        "samples",
        "sounds",
        "channels",
        "songs"
    ]

    const [ folders, setFolders ] = useState([initSketchpadFolder])
    const [ selectedSketchpadFolder, setSelectedSketchpadFolder ] = useState(null)
    
    const [ sketchpadVersions, setSketchpadVersions ] = useState(null)
    const [ selectedSketchpadVersion, setSelectedSketchpadVersion ] = useState(null)

    const [ selectedSketchpadScene, setSelectedSketchpadScene ] = useState(null)
    
    const [ currentSketchpad, setCurrentSketchpad ] = useState(null)
    // console.log(currentSketchpad, " CURRENT SKETCH PAD")

    const [ scenes, setScenes ] = useState(null)

    const [ isGeneratingItemGroups, setIsGeneratingItemGroups ] = useState(false);
    const [ itemGroupsGenerationIndex, setItemGroupsGenerationIndex ] = useState(null);
    const [ itemGroupTypeGenerationIndex, setItemGroupTypeGenerationIndex ] = useState(0)
    const previousIGTgenerationIndex = usePrevious(itemGroupTypeGenerationIndex)

    const [ clips, setClips ] = useState(null)
    // console.log(clips)
    const [ patterns, setPatterns ] = useState(null)
    const [ samples, setSamples ] = useState(null)
    const [ sounds, setSounds ] = useState(null)
 
    const [ sketchpadItemGroups, setSketchpadItemGroups ] = useState(null)
    const [ selectedSketchpadItemGroup, setSelectedSketchpadItemGroup ] = useState(null)

    const [ selectedSketchpadItemGroupItem, setSelectedSketchpadItemGroupItem ] = useState(null)

    // console.log(selectedSketchItemGroupItem,"selected sketch item group item")

    useEffect(() => {
        getSketchFolders();
    },[])

    useEffect(() => {
        if (selectedSketchpadFolder !== null){
            getSketchVersions()
        }
    },[selectedSketchpadFolder])

    useEffect(() => {
        if (selectedSketchpadVersion !== null){
            getSketch()
            setSelectedSketchpadScene(null)
            setClips(null)
            setPatterns(null)
            setSamples(null)
            setSounds(null)
            setSelectedSketchpadItemGroup(null)
            setSketchpadItemGroups(null)
            generateScenes()
        }
    },[selectedSketchpadVersion])

    useEffect(() => {
        setClips(null)
        setPatterns(null)
        setSamples(null)
        setSounds(null)
        setSelectedSketchpadItemGroup(null)
        setSketchpadItemGroups(null)
    },[selectedSketchpadScene])

    useEffect(() => {
        if (selectedSketchpadItemGroup !== null){
            setSelectedSketchpadItemGroupItem(null);
        }
    },[selectedSketchpadItemGroup])

    useEffect(() => {
        if (currentSketchpad !== null && selectedSketchpadScene !== null){
            setIsGeneratingItemGroups(true)
        }
    },[currentSketchpad,selectedSketchpadScene])

    useEffect(() => {
        if (isGeneratingItemGroups === true){
            setItemGroupsGenerationIndex(0)
        }
    },[isGeneratingItemGroups])

    useEffect(() => {
        if (itemGroupTypeGenerationIndex !== null){

            if (itemGroupTypeGenerationIndex === 0 && previousIGTgenerationIndex === (itemGroupTypeArray.length - 3)){

                if (itemGroupsGenerationIndex + 1 >= currentSketchpad.channels.length){
                    setSketchpadItemGroups({clips,patterns,samples,sounds,channels:[0,1,2,3,4,5,6,7,8,9],songs:[0,1,2]})
                    setIsGeneratingItemGroups(false)
                } else {
                    const newIGGIndex = itemGroupsGenerationIndex + 1;
                    setItemGroupsGenerationIndex(newIGGIndex)
                }
            } else {
                generateItemGroups()
            }
        }
    },[itemGroupTypeGenerationIndex])

    useEffect(() => {
        if (itemGroupTypeGenerationIndex !== null){
            generateItemGroups()
        }
    },[itemGroupsGenerationIndex])

    async function getSketchFolders(){
        
    }

    async function getSketchVersions(){

        const folderPath = selectedSketchpadFolder.path.split('/').join('+++');
        const response = await fetch(`http://${window.location.hostname}:3000/mydata/+++home+++pi+++zynthian-my-data+++${folderPath.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();
    
        let newSketchVersions = [];

        res.forEach(function(sv,index){
            if (sv.path.indexOf(selectedSketchpadFolder.path) > -1){
                if (sv.path.indexOf("sketchpad.json") > -1) newSketchVersions.push(sv)
            }
        })

        setSketchpadVersions(newSketchVersions)
    }

    async function getSketch(){
        const response = await fetch(`http://${window.location.hostname}:3000/sketch/${selectedSketchpadVersion.path.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const res = await response.json();
        setCurrentSketchpad(res)    
    }

    async function generateScenes(){
        // count clips, patterns, samples, sounds, channels, songs, SUKA BLYATZ
    }

    async function generateItemGroups(){
        

        if (itemGroupTypeGenerationIndex === 0){
            getSketchpadClips()
        } else if (itemGroupTypeGenerationIndex === 1){
            if (patterns === null) onGetScenePatterns()
            else setItemGroupTypeGenerationIndex(2)
        } else if (itemGroupTypeGenerationIndex === 2){
            generateChannelSamples()
        } else if (itemGroupTypeGenerationIndex === 3){
            let soundsArray = [];
            if (sounds !== null) soundsArray = [...sounds]
            generateChannelSounds(soundsArray)
        }

    }

    function getSketchpadClips(){
        const channel = currentSketchpad.channels[itemGroupsGenerationIndex]
        const newClips = clips !== null ? [...clips] : [];

        console.log(channel, " channel")

        channel.clips.forEach(async function(part,pIndex){
            console.log(part)
            // console.log(part,"channel.clips[pIndex]")
            const cIndex =  letters.findIndex(letter => letter === selectedSketchpadScene);
            if (part[cIndex].path !== null){
                const clip = part[cIndex];
                clip.channel = itemGroupTypeGenerationIndex;
                newClips.push(clip)                
            }
        })

        // channel.clips.forEach(async function(clip,cIndex){
        //     if (cIndex === letters.findIndex(letter => letter === selectedSketchScene) && clip.path !== null) {
        //         clip.channel = cIndex;
        //         newClips.push(clip)
        //     }
        // })
        console.log(newClips, " NEW CIPS ")
        setClips(newClips)
        incrementItemGenerationIndex()
    }

    function onGetScenePatterns(){

        const sketchFileName = selectedSketchpadVersion.path.split('/')[selectedSketchpadVersion.path.split('/').length - 1]
        const currentSketchFolder = selectedSketchpadVersion.path.split(sketchFileName)[0]
        const scenePatternsPath = `${currentSketchFolder}sequences/scene-${selectedSketchpadScene}/patterns/`

        fetch(`http://${window.location.hostname}:3000/folder/${scenePatternsPath.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).catch(function(error) {
            console.log(error,"error");
        }).then(async function(res){
            console.log(res);
            const scenePatterns = await res.json();
            if (scenePatterns.length > 0) getScenePatterns(scenePatterns,0,[],scenePatternsPath)
            else setItemGroupTypeGenerationIndex(2)
        })
    }

    function getScenePatterns(scenePatterns, index, patternsArray,scenePatternsPath){
        fetch(`http://${window.location.hostname}:3000/json/${scenePatterns[index].path.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).catch(function(error) {
            console.log(error,"error");
        }).then(async function(res){
            if (res.status === 500){
                console.log('ERROR')
                console.log(res)
            } else {
                let pattern = await res.json()
                pattern.name = scenePatterns[index].path.split('/patterns/')[1].split('.pattern.json')[0];
                patternsArray.push(pattern)
            }
            if (index === scenePatterns.length - 1){
                setPatterns(patternsArray)
                setItemGroupTypeGenerationIndex(2)
            } else {
                getScenePatterns(scenePatterns,index + 1,patternsArray)
            }
        })
    }

    async function generateChannelSamples(){

        const newSamples = samples !== null ? [...samples ] : [];
        
        const fileName = selectedSketchpadVersion.path.split('/')[selectedSketchpadVersion.path.split('/').length - 1];
        const folderName = selectedSketchpadVersion.path.split(fileName)[0];
        const trackUrl = `${folderName.split('/').join('+++').split(' ').join('%20')}:${itemGroupsGenerationIndex+1}`;
        console.log(trackUrl, " TRACK URL ")
        fetch(`http://${window.location.hostname}:3000/track/${trackUrl}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(res){

            console.log(res, " RES FROM FETCH SAMPLES")

            if (res.status === 500){
                setSamples(newSamples)
                incrementItemGenerationIndex()
                return;
            }

            const samples = await res.json();
        
            samples.forEach(function(sample,sIndex){
                if (sample !== null) {
                    sample.channel = itemGroupsGenerationIndex;
                    sample.slot = sIndex;
                    newSamples.push(sample)
                }
            })
        
            setSamples(newSamples)
            incrementItemGenerationIndex()
        })

    }

    function generateChannelSounds(soundsArray){

        const channel = currentSketchpad.channels[itemGroupsGenerationIndex]
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

            channel.chainedSounds.forEach(function(chainedSound,csIndex){
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

    function incrementItemGenerationIndex(val){
        let newIGTGIndex = itemGroupTypeGenerationIndex + 1;
        if (newIGTGIndex === itemGroupTypeArray.length - 2) newIGTGIndex = 0;
        setItemGroupTypeGenerationIndex(newIGTGIndex)
    }

    function onSetSelectedSketchItemGroup(val){
        const iggtIndex = itemGroupTypeArray.findIndex((igt,index) => val === igt);
        setSelectedSketchpadItemGroup(iggtIndex)
    }

    let sketchVersionColumnDisplay;
    if (sketchpadVersions !== null){
        sketchVersionColumnDisplay = (
            <SketchPadXtractorColumn 
                type="versions"
                items={sketchpadVersions}
                onSelectItem={setSelectedSketchpadVersion}
                color={colorsArray[1]}
            />            
        )
    }

    let sketchScenesColumnDisplay;
    if (selectedSketchpadVersion !== null){
        sketchScenesColumnDisplay = (
            <SketchPadXtractorColumn 
                type="scenes"
                onSelectItem={setSelectedSketchpadScene}
                item={selectedSketchpadScene}
                color={colorsArray[2]}
                letters={letters}
            />
        )
    }

    let sketchItemGroupColumnDisplay;
    if (sketchpadItemGroups !== null){
        sketchItemGroupColumnDisplay = (
            <SketchPadXtractorColumn 
                type={"item groups"}
                items={sketchpadItemGroups}
                subType={itemGroupTypeArray[selectedSketchpadItemGroup]}
                onSelectItem={onSetSelectedSketchItemGroup}
                color={colorsArray[3]}
             />
        )
    } else if (isGeneratingItemGroups === true){
        sketchItemGroupColumnDisplay = (
            <div className='loader-container'>
                <div className="lds-ellipsis">
                    <div></div><div></div><div></div><div></div>
                </div>
            </div>
        )
    }

    let sketchItemGroupItemsColumnDisplay;
    if (selectedSketchpadItemGroup !== null){
        const items = sketchpadItemGroups[itemGroupTypeArray[selectedSketchpadItemGroup]];
        sketchItemGroupItemsColumnDisplay = (
            <SketchPadXtractorColumn 
                type={"items"}
                subType={itemGroupTypeArray[selectedSketchpadItemGroup]}
                items={items}
                onSelectItem={setSelectedSketchpadItemGroupItem}
                color={colorsArray[4]}
             />
        )
    }

    let sketchItemSelectedItemColumnDisplay;
    if (selectedSketchpadItemGroupItem !== null){
        sketchItemSelectedItemColumnDisplay  = (
            <SketchPadXtractorColumn 
                type={"item"}
                subType={itemGroupTypeArray[selectedSketchpadItemGroup]}
                item={selectedSketchpadItemGroupItem}
                // onSelectItem={setSelectedSketchItemGroupItem}
                color={colorsArray[5]}
            />
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
                        onSelectItem={setSelectedSketchpadFolder}
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
                <div className='sketch-pad-xtractor-column' style={{backgroundColor:colorsArray[5]}}>
                    <h4>
                        <GiMagnifyingGlass/>
                        Details
                    </h4>
                    {sketchItemSelectedItemColumnDisplay}
                </div>
            </div>
        </div>
    )
}




export default SketchPadXtractor;