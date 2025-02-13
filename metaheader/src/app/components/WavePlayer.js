import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

function WavePlayer({ audioUrl }) {
    const waveformRef = useRef(null);
    const waveSurferRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
  
    useEffect(() => {
      if (!waveformRef.current) return;
  
      // Destroy existing instance if reloading new audio
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
      }
  
      // Initialize WaveSurfer
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#ADD8E6",
        progressColor: "#87CEEB",
        cursorColor: "navy",
        barWidth: 2,
        responsive: true,
      });
  
      waveSurferRef.current.load(audioUrl);
      togglePlay();
      waveSurferRef.current.on("finish", () => setIsPlaying(false));
  
      return () => {
        if (waveSurferRef.current) {
          waveSurferRef.current.destroy();
          setIsPlaying(false);
        }
      };
    }, [audioUrl]);
  
    const togglePlay = () => {
      if (waveSurferRef.current) {
        waveSurferRef.current.playPause();
        setIsPlaying(waveSurferRef.current.isPlaying());
      }
    };
  
    return (
      <div>
        <div ref={waveformRef} />
        <button onClick={togglePlay} >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>
    );
}

export default WavePlayer