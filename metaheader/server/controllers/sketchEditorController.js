const fs = require('fs'); 
const path = require("path")
const rootFolder = "/home/pi/zynthian-my-data/"

const sampleSetFolder = `${rootFolder}sketches/my-sketches/temp/wav/sampleset/bank`

exports.getSketchInfo = (req,res) => {
  var file = fs.readFileSync(`${rootFolder}sessions/.cache.json`);
  var json = JSON.parse(file);
  res.json(json)
}

exports.getSketchList = (req,res) => {
  const dirList = fs.readdirSync(`${rootFolder}sketches/my-sketches/temp/`)
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
  var file = fs.readFileSync(`${sampleSetFolder}.${req.params.id}/bank.json`);
  var json = JSON.parse(file);
  res.json(json)
}

exports.updateTrack = (req,res) => {

  // console.log('UPDATE TRACK')

  const trackId = req.params.id;
  
  let sPath = req.body.sPath;
  if (sPath.indexOf('%') > -1) sPath = sPath.split('%').join('/');
  if (sPath.indexOf('++') > -1) sPath = sPath.split('++').join('.');

  // console.log(sPath,"sample path");

  let sampleSetJson;
  if (!fs.existsSync(`${sampleSetFolder}.${trackId}/`)){
    
    fs.mkdirSync(`${sampleSetFolder}.${trackId}/`)
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
    let rawdata = fs.readFileSync(`${sampleSetFolder}.${trackId}/bank.json`);
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

  fs.writeFileSync(`${sampleSetFolder}.${trackId}/bank.json`, JSON.stringify(sampleSetJson));
  var json = JSON.parse( fs.readFileSync(`${sampleSetFolder}.${trackId}/bank.json`));
  res.status(200).json(json)
}

exports.getSample = (req,res) => {
  const trackId = req.params.id.split('+++')[0];
  let samplePath = req.params.id.split('+++')[1].split('++').join('.');
  if (samplePath.indexOf('+') > -1) samplePath = samplePath.split('+').join('/');
  let filePath = `${sampleSetFolder}.${trackId}/${samplePath}`
  if (samplePath.indexOf('/') > -1) filePath = samplePath; 
  var file = fs.readFileSync(filePath, 'binary');
  res.setHeader('Content-Disposition', 'attachment; filename='+samplePath);
  res.write(file, 'binary');
  res.end();
}

exports.getClip = (req,res) => {
  const clipsFolder = `${rootFolder}sketches/my-sketches/temp/wav`
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

  let rawdata = fs.readFileSync(`${sampleSetFolder}.${trackIndex}/bank.json`);
  let currentSampleSetJson = JSON.parse(rawdata);

  let sampleSetJson = [];
  for (var i = 0; i < 5; ++i){
    if (i === sIndex){
      sampleSetJson[i] = null
    } else {
      sampleSetJson[i] = currentSampleSetJson[i];
    }
  }

  fs.writeFileSync(`${sampleSetFolder}.${trackIndex}/bank.json`, JSON.stringify(sampleSetJson));
  if (sPath && sPath.indexOf('/') === -1) fs.unlinkSync(`${sampleSetFolder}.${trackIndex}/${sPath}`)
  var json = JSON.parse( fs.readFileSync(`${sampleSetFolder}.${trackIndex}/bank.json`));
  res.json(json)
}