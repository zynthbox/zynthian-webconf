import React, { useEffect,useRef,useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { getSoundInfo } from  '../../../store/sound-manager/SoundManagerSlice'; 
import WavesurferPlayer from '@wavesurfer/react'


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

    let waveDisplay;
    if(soundSelected){
      let url = (soundSelected.indexOf('/zynthian/')>-1) ? soundSelected.split('/zynthian/')[1] : soundSelected ;   
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

  //  useEffect(() => {
  //     dispatch(getSoundInfo())           
  //   },[soundSelected])

  return (                        
            <div>
               
                {waveDisplay}                            
                
            </div>                                                                                         
  )
}
export default SoundEditor

