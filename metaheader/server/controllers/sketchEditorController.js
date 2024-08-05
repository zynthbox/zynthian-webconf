const fs = require('fs'); 
const path = require("path")
const rootFolder = "/home/pi/zynthian-my-data/"
var sampleBankFolder = `${rootFolder}sketchpads/my-sketchpads/temp/wav/sampleset/sample-bank`;
const zynthboxConfigFolder = `/root/.config/zynthbox/zynthbox-qml.conf`;
// for local testing
// const zynthboxConfigFolder = `${rootFolder}sessions/zynthbox-qml.conf`;  

function getLastSelectedSketchFolderName(){
    var ConfigIniParser = require("config-ini-parser").ConfigIniParser;
    parser = new ConfigIniParser(); //Use default delimiter
    var file = fs.readFileSync(zynthboxConfigFolder,'utf8');  
    parser.parse(file);
    var lastSelectedSketchpad = parser.get("Sketchpad","lastSelectedSketchpad"); 
    var folderName  = lastSelectedSketchpad.split('/my-sketchpads/')[1].split('/')[0];  
    return folderName; 

}

exports.getSketchInfo = (req,res) => {

    var ConfigIniParser = require("config-ini-parser").ConfigIniParser;
    parser = new ConfigIniParser(); //Use default delimiter
    var file = fs.readFileSync(zynthboxConfigFolder,'utf8');  
    parser.parse(file);
    var sketchpad = parser.items("Sketchpad");
    const entries = new Map(sketchpad);
    const config = Object.fromEntries(entries);
    res.json(config);    
}

exports.getSketchList = (req,res) => {
  const dirList = fs.readdirSync(`${rootFolder}sketches/my-sketches/`)
  res.json(dirList)
}

exports.getSketch = (req,res) => {
  let sketchPath = req.params.path.split('+++').join('/');
  sketchPath = sketchPath.split('zynthian-my-data/')[1];
  var file = fs.readFileSync(`${rootFolder}${sketchPath}`);
  var json = JSON.parse(file);
  res.json(json)
}

exports.getTrack = (req,res) => {

  let trackSampleBankFolder = req.params.id.split(':')[0].split('+++').join('/');
  trackSampleBankFolder += "wav/sampleset/sample-bank";
  const trackId = req.params.id.split(':')[1];

  sampleBankFolder = sampleBankFolder.replace('/temp/',`/${getLastSelectedSketchFolderName()}/`)
  const sampleBankJsonPath = `${trackSampleBankFolder}.${trackId}/sample-bank.json`
  if (fs.existsSync(sampleBankJsonPath)){
    var file = fs.readFileSync(sampleBankJsonPath);
    var json = JSON.parse(file);
    res.json(json)
  } else {
    res.json({message:`sample bank file ${sampleBankJsonPath} doesnt exist!`})
  }
}

exports.updateTrack = (req,res) => {

  // sampleSetFolder = sampleSetFolder.replace('/temp/',`/${getLastSelectedSketchFolderName()}/`)

  // console.log('UPDATE TRACK')

  sampleBankFolder = req.params.id.split(':')[0].split('+++').join('/');
  sampleBankFolder += "wav/sampleset/sample-bank";
  const trackId = req.params.id.split(':')[1];

  
  let sPath = req.body.sPath;
  if (sPath.indexOf('%') > -1) sPath = sPath.split('%').join('/');
  if (sPath.indexOf('++') > -1) sPath = sPath.split('++').join('.');

  // console.log(sPath,"sample path");

  let sampleSetJson;
  if (!fs.existsSync(`${sampleBankFolder}.${trackId}/`)){
    
    fs.mkdirSync(`${sampleBankFolder}.${trackId}/`)
    sampleSetJson = []
    for (var i = 0; i < 5; ++i){
      if (i === req.body.sIndex){
        sampleSetJson[i] = {
          path:sPath
        }
      } else {
        sampleSetJson[i] = null;
      }
    }  
  } else {
    let rawdata = fs.readFileSync(`${sampleBankFolder}.${trackId}/sample-bank.json`);
    currentSampleSetJson = JSON.parse(rawdata);
    sampleSetJson = []
    for (var i = 0; i < 5; ++i){
      if (i === req.body.sIndex){
        sampleSetJson[i] = {
          path:sPath
        }
      } else {
        sampleSetJson[i] = currentSampleSetJson[i];
      }
    }
  }

  // console.log(sampleSetJson,"sampleSetJson")

  fs.writeFileSync(`${sampleBankFolder}.${trackId}/sample-bank.json`, JSON.stringify(sampleSetJson));
  var json = JSON.parse( fs.readFileSync(`${sampleBankFolder}.${trackId}/sample-bank.json`));
  res.status(200).json(json)
}

exports.getSample = (req,res) => {
  sampleBankFolder = sampleBankFolder.replace('/temp/',`/${getLastSelectedSketchFolderName()}/`)
  const trackId = req.params.id.split('+++')[0];
  let samplePath = req.params.id.split('+++')[1].split('++').join('.');
  if (samplePath.indexOf('+') > -1) samplePath = samplePath.split('+').join('/');
  let filePath = `${sampleBankFolder}.${trackId}/${samplePath}`
  if (samplePath.indexOf('/') > -1) filePath = samplePath; 
  var file = fs.readFileSync(filePath, 'binary');
  res.setHeader('Content-Disposition', 'attachment; filename='+samplePath);
  res.write(file, 'binary');
  res.end();
}

exports.getClip = (req,res) => {
  //const clipsFolder = `${rootFolder}sketches/my-sketches/${getLastSelectedSketchFolderName()}/wav`
  const clipsFolder = `${rootFolder}sketchpads/my-sketchpads/${getLastSelectedSketchFolderName()}/wav`
  let samplePath = req.params.id.split('+++')[1].split('++').join('.');
  if (samplePath.indexOf('+') > -1) samplePath = samplePath.split('+').join('/');
  let filePath = `${clipsFolder}/${samplePath}`
  if (samplePath.indexOf('/') > -1) filePath = samplePath; 
  var file = fs.readFileSync(filePath, 'binary');
  res.setHeader('Content-Disposition', 'attachment; filename='+samplePath);
  res.write(file, 'binary');
  res.end();
}

exports.removeSample = (req,res) => {

  const { trackIndex, sPath, sIndex } = req.body;
  sampleBankFolder = sampleBankFolder.replace('/temp/',`/${getLastSelectedSketchFolderName()}/`)
  let rawdata = fs.readFileSync(`${sampleBankFolder}.${trackIndex}/sample-bank.json`);
  let currentSampleSetJson = JSON.parse(rawdata);

  let sampleSetJson = [];
  for (var i = 0; i < 5; ++i){
    if (i === sIndex){
      sampleSetJson[i] = null
    } else {
      sampleSetJson[i] = currentSampleSetJson[i];
    }
  }

  fs.writeFileSync(`${sampleBankFolder}.${trackIndex}/sample-bank.json`, JSON.stringify(sampleSetJson));
  if (sPath && sPath.indexOf('/') === -1) fs.unlinkSync(`${sampleBankFolder}.${trackIndex}/${sPath}`)
  var json = JSON.parse( fs.readFileSync(`${sampleBankFolder}.${trackIndex}/sample-bank.json`));
  res.json(json)
}
