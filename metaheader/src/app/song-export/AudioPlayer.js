import React, { useEffect, useRef, useState } from 'react'
import { FaPauseCircle, FaPlayCircle } from 'react-icons/fa'
import { AiOutlineLoading } from 'react-icons/ai'
import {ImFolderDownload} from 'react-icons/im'
import { millisToMinutesAndSeconds, humanFileSize } from '../helpers'

const AudioPlayer = ({item}) => {

  const [ data, setData ] = useState(null)
  const [ isPlaying, setIsPlaying ] = useState(false)
  const [ trackTime, setTrackTime ] = useState('00:00')
  const [ trackTimeSeconds, setTrackTimeSeconds ] = useState(0)
  const [ trackDuration, setTrackDuration ] = useState()
  const [ trackDurationSeconds, setTrackDurationSeconds ] = useState(0)
  const [ trackProgress, setTrackProgress ] = useState(0)

  useEffect(() => {
    getData()
  },[])

  useEffect(() => {
    if (trackProgress === 100){
      setIsPlaying(false)
    }
  },[trackProgress])

  useEffect(() => {
    if (data !== null){
      const draggableDiv = document.getElementById(item.path)
      draggableDiv.removeEventListener('dragstart', handleDragStart)
      draggableDiv.removeEventListener('dragend',handleDragEnd)
      draggableDiv.addEventListener('dragstart', handleDragStart)
      draggableDiv.addEventListener('dragend',handleDragEnd)

    }
  },[data])

  function handleDragStart(e){
    var file = new File([data], item.name, {type:"audio/wav"});
    const dataList = e.dataTransfer.items;
    dataList.add(file);
    console.log(e.dataTransfer.files, " DATA TRANSFER FILES")
    console.log(e.dataTransfer.items[0])
  }
  
  function handleDragEnd(e){
    if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {  
      console.log("I'm out");  
      downloadFile()
    }
  }

  async function getData(){
    const filePath = item.path;
    const response = await fetch(`http://${window.location.hostname}:3000/download`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body:JSON.stringify({filePath})
    });
    if (filePath === item.path){
      const data = await response.blob();
      var url = window.URL.createObjectURL(data);
      setData(url)
    }
  }

  function downloadFile(){
    var a = document.createElement('a');
    a.href = data;
    let dlFileName = item.path.split('/')[item.path.split('/').length - 1]
    a.download = dlFileName;
    document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
    a.click();
    a.remove();
  }

  function onPlayClick(){
    console.log('on play click - ' + item.path)
    if (data !== null){
      console.log('data is not null')
      const playerElement = document.getElementById(`audio-player-${item.name}`).getElementsByTagName('audio');
      if (isPlaying === true){
        playerElement[0].pause();
        setIsPlaying(false);
      } else {
        if (trackProgress === 100) playerElement[0].currentTime = 0;
        playerElement[0].play();
        setIsPlaying(true);
      }
    }
  }

  function onUpdateTrackProgress(e){
    if (data !== null){ 
      const sliderParent = document.getElementById(`${item.path}-slider`);
      const sliderParentWidth = sliderParent.offsetWidth;
      const sliderParentRect = sliderParent.getBoundingClientRect();
      const relClickPosition = e.clientX - sliderParentRect.left;
      const newTrackProgress = ( relClickPosition / sliderParentWidth ) * 100;
      const newTrackTimeSeconds = (  trackDurationSeconds / 100 ) * newTrackProgress
      const playerElement = document.getElementById(`audio-player-${item.name}`).getElementsByTagName('audio');
      playerElement[0].currentTime = newTrackTimeSeconds;
    }
  }
  
  function onPlayerTimeUpdate(e){
    const playerElement = e.target;
    const newCurrentTrackTime = millisToMinutesAndSeconds(playerElement.currentTime);
    let newTrackDurationSeconds = playerElement.duration;
    if (isNaN(newTrackDurationSeconds)){ newTrackDurationSeconds = 0; }
    const newTrackDuration = millisToMinutesAndSeconds(newTrackDurationSeconds);
    const newTrackProgress = (playerElement.currentTime / playerElement.duration) * 100;
    setTrackTime(newCurrentTrackTime);
    setTrackTimeSeconds(playerElement.duration);
    setTrackDurationSeconds(newTrackDurationSeconds)
    setTrackDuration(newTrackDuration );
    setTrackProgress(newTrackProgress);
  }

  const nodeRef = useRef(null)

  let playButtonDisplay = <span className='rotating'><AiOutlineLoading/></span>
  if (data !== null){
    if (isPlaying === true) playButtonDisplay = <FaPauseCircle/>
    else playButtonDisplay =  <FaPlayCircle/>
  }

  let trackDurationDisplay =  <span className='infinity'>&infin;</span>
  if (trackDuration) trackDurationDisplay = trackDuration;

  const trackName = item.name.split('-20')[0];
  const trackExportDateTime = item.name.split(trackName+'-')[1];
  const trackExportDate = trackExportDateTime.split('T')[0].split('-').join('/');
  const trackExportTime = trackExportDateTime.split('T')[1].split('.')[0]

  return (
    <div className='audio-player' id={`audio-player-${item.name}`}>

      <audio 
        src={data}
        onTimeUpdate={(e) => onPlayerTimeUpdate(e)}  
        onLoadedMetadata={(e) => onPlayerTimeUpdate(e)}
      />

      <span onClick={downloadFile} className='count'> <ImFolderDownload/> </span>

      <div className='audio-player-top'>

        <div className='audio-player-controls'>
          <span onClick={() => onPlayClick()}>
            {playButtonDisplay}
          </span>
        </div>

        <div ref={nodeRef} draggable={true} id={item.path} className='draggable-div item-info'>
          <h4>{trackName}</h4>
          <small>
            <b>{humanFileSize(item.size)}</b>
            <b>{trackExportDate} </b>
            <b>{trackExportTime}</b>
          </small>
        </div>
      </div>

      <div className='audio-player-bottom'>
        <div className='track-time'>{trackTime}</div>
        <div id={`${item.path}-slider`} className='slider'>
          <div className='progress' style={{width:trackProgress+"%"}}></div>
          <div onClick={e => onUpdateTrackProgress(e)} className='rail'></div>
        </div>
        <div className='track-duration'>{trackDurationDisplay}</div>
      </div>

    </div>
  )
}

export default AudioPlayer

/**
 * 
 * 
 * 
 * 
 * 
    <div>
      DRAG ME
    </div>


(function($) {
    $.fn.extend({
    
      dragout : function () {
        var files = this;
        if(files.length > 0) {
          var use_data = (typeof files[0].dataset === "undefined") ? false : true;
          $(files).each(function() {
            var url = use_data ? this.dataset.downloadurl : this.getAttribute("data-downloadurl");
            this.addEventListener("dragstart",function(e){
              e.dataTransfer.setData("DownloadURL",url);
            },false);
          });
        }
      }
});
})(jQuery);
*/