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
  const trackId = req.params.id;
  let sampleSetJson;
  if (!fs.existsSync(`${sampleSetFolder}.${trackId}/`)){
    fs.mkdirSync(`${sampleSetFolder}.${trackId}/`)
    sampleSetJson = []
    for (var i = 0; i < 5; ++i){
      if (i === req.body.sIndex){
        sampleSetJson[i] = {
          path:req.body.sPath
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
          path:req.body.sPath
        }
      } else {
        sampleSetJson[i] = currentSampleSetJson[i];
      }
    }
  }

  fs.writeFileSync(`${sampleSetFolder}.${trackId}/bank.json`, JSON.stringify(sampleSetJson));
  var json = JSON.parse( fs.readFileSync(`${sampleSetFolder}.${trackId}/bank.json`));
  res.status(200).json(json)
}

exports.getSample = (req,res) => {
  const trackId = req.params.id.split('+++')[0];
  const samplePath = req.params.id.split('+++')[1].split('++').join('.');
  var file = fs.readFileSync(`${sampleSetFolder}.${trackId}/${samplePath}`, 'binary');
  res.setHeader('Content-Disposition', 'attachment; filename='+samplePath);
  res.write(file, 'binary');
  res.end();
}

exports.updateSampleSet = (req,res) => {
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
  fs.unlinkSync(`${sampleSetFolder}.${trackIndex}/${sPath}`)
  var json = JSON.parse( fs.readFileSync(`${sampleSetFolder}.${trackIndex}/bank.json`));
  res.json(json)
}