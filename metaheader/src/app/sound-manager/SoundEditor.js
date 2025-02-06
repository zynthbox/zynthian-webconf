import React, { useEffect,useRef,useState,lazy, Suspense } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { getSoundMeta, zynthbox_snd_metadata_extractor} from  '../../../store/sound-manager/SoundManagerSlice'; 
import WavesurferPlayer from '@wavesurfer/react'
import LoadingSpinner from '../loading-spinner';
const Favorites = lazy(()=>import('../../../store/favorites/favorites'))
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
];
const getCategoryName =(categoryKey)=>{
      const categoryNameMapping = {
        "0": "Uncategorized",
        "1": "Drums",
        "2": "Bass",
        "3": "Leads",
        "4": "Synth/Keys",
        "5": "Strings/Pads",
        "6": "Guitar/Plucks",
        "99": "FX/Other",
    }
    return categoryNameMapping[categoryKey];   
}

const SoundEditor = () => {    
    const dispatch = useDispatch();    
    const { soundSelected , soundInfo} = useSelector((state) => state.soundmanager);
  
    const [wavesurfer, setWavesurfer] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)

    const onReady = (ws) => {
      setWavesurfer(ws)
      setIsPlaying(false)
    }
    const onPlayPause = () => {
      wavesurfer && wavesurfer.playPause()
    }
    useEffect(() => {      
      // dispatch(zynthbox_snd_metadata_extractor()) 
      dispatch(getSoundMeta())           
    },[soundSelected])

    let waveDisplay;
    if(soundSelected){
      let path = (soundSelected.indexOf('/zynthian/')>-1) ? soundSelected.split('/zynthian/')[1] : soundSelected ;   
      let url = `http://${window.location.hostname}:3000/${path}`

      console.log(url);
      // url = 'http://localhost:3000/zynthian-my-data/sounds/my-sounds/EightiesMemoriestest2.snd'   
      // url = 'http://localhost:3000/zynthian-my-data/sounds/my-sounds/Rubato-Valley.wav'
      // url = 'http://localhost:3000/zynthian-my-data/sounds/my-sounds/01 - By Purple Motion of.wav'      
      // url = 'http://localhost:3000/zynthian-my-data/sketchpads/my-sketchpads/Sketchpad-dong//wav/sampleset/sample-bank.1/01 - By Purple Motion of.wav'
      waveDisplay =       <> <WavesurferPlayer
                            height={100}
                            waveColor="violet"
                            url={url}
                            onReady={onReady}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                          />

                          <button onClick={onPlayPause}>
                            {isPlaying ? 'Pause' : 'Play'}
                          </button>
                          </>
    }


    let metaDisplay = null;
    if(soundInfo){
      metaDisplay = <div className='sound-meta'> 
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "2px" }}>    
                        <div style={{ display: "flex", gap: "2px" }}>Category:{soundInfo.category}</div>           
                        <div style={{ display: "flex", gap: "2px" }}>
                          <div style={{ width: "16.6%", backgroundColor: "#ccc", padding: "2px" }}>Samples</div>
                            {soundInfo.sampleSlotsData.map(s=>(
                              <div style={{ width: "16.6%", backgroundColor: "#eef", padding: "2px" }}>{s}</div>
                            ))}                  
                        </div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          <div style={{ width: "16.6%", backgroundColor: "#ccc", padding: "2px" }}>Synths</div>
                            {soundInfo.synthSlotsData.map(s=>(
                              <div style={{ width: "16.6%", backgroundColor: "#eef", padding: "2px" }}>{s}</div>
                            ))}                  
                        </div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          <div style={{ width: "16.6%", backgroundColor: "#ccc", padding: "2px" }}>Fx</div>
                            {soundInfo.fxSlotsData.map(s=>(
                              <div style={{ width: "16.6%", backgroundColor: "#eef", padding: "2px" }}>{s}</div>
                            ))}                  
                        </div>
                      </div>
                    </div>
    }
 

  return (                        
            <div>
               
                {waveDisplay}                                          
                {metaDisplay}
                <div id="favorites-container" className="container">                   
                    <Suspense fallback={<LoadingSpinner/>}>
                        <Favorites colorsArray={colorsArray} /> 
                    </Suspense>
                </div>

            </div>                                                                                         
  )
}
export default SoundEditor

