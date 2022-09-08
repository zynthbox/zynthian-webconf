export const generateNewSamples = (sampleIndex,samples,files) => {
    const samplesArray = [null,null,null,null,null]
    let newSamples = [];
    for ( var i in samplesArray){
      if (sampleIndex){
        if (sampleIndex == i){
          newSamples.push({
            path:files[0].name,
            keyZoneStart:0,
            keyZoneEnd:127,
            rootNote:60,
          })
        } else newSamples.push(samples[i])
      } else {
        if (files[i] && files[i].name) {
          newSamples.push({
            path:files[i].name,
            keyZoneStart:0,
            keyZoneEnd:127,
            rootNote:60,
          })
        } else newSamples.push(null)
      }
    }
    return newSamples;
}
  
export const getCurrentSketchpadFolder = (lastSelectedSketchpad,sketchpadName) => {
    return lastSelectedSketchpad.split(`${sketchpadName}.sketchpad.json`)[0]
}
  
export const getSampleSelectedFolder = (folder,channelIndex) => {
    return `/${folder.split('zynthian/')[1]}wav/sampleset/sample-bank.${channelIndex + 1}/`
}