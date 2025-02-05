import React, { useEffect,useRef,useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { getSoundInfo } from  '../../../store/sound-manager/SoundManagerSlice'; 
import { parseWebStream,orderTags} from 'music-metadata';

const SoundEditor = () => {    
    const dispatch = useDispatch();    
    const { soundSelected , soundInfo} = useSelector((state) => state.soundmanager);
  
    const [audioContext, setAudioContext] = useState(null);
    const [source, setSource] = useState(null);


    useEffect(() => {
      dispatch(getSoundInfo())           
    },[soundSelected])

  

    useEffect(() => {
      // Create the AudioContext when the component mounts
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);

      return () => {
          // Close the AudioContext when unmounting
          context.close();
      };
  }, []);



  const playAudio = async () => {
    if (!audioContext) return;
    // let url = (soundSelected.indexOf('/zynthian/')>-1) ? soundSelected.split('/zynthian/')[1] : soundSelected ;   
    // let url = 'http://localhost:3000/zynthian-my-data/sounds/my-sounds/01 - By Purple Motion of.wav'  
    let url = 'http://localhost:3000/zynthian-my-data/sounds/my-sounds/01 - By Purple Motion of.snd'  

    // no
    // url = 'http://localhost:3000/zynthian-my-data/sounds/my-sounds/Rubato-Valley.wav'
    // url = 'http://localhost:3000/zynthian-my-data/sounds/my-sounds/EightiesMemoriestest2.snd'
    // url = 'http://localhost:3000/zynthian-my-data/sounds/my-sounds/street_j.mod'
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Create and configure the audio source
    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(audioContext.destination);
    sourceNode.start(0);

    setSource(sourceNode);
};
  const stopAudio = () => {
    if (source) {
        source.stop();
    }
  };
  return (                        
    <div>
    <button onClick={playAudio}>Play</button>
    <button onClick={stopAudio}>Stop</button>

      {soundInfo &&
        <div>
          {JSON.stringify(soundInfo)}
        </div>
      } 
    </div>                                                                                     
  )
}
export default SoundEditor

