const fs = require("fs");
const fsextra = require('fs-extra')
const path = require('path');
const { exec } = require('child_process');
const { loadMusicMetadata } = require('music-metadata');

const CONFIG_SOUNDS_INDEX_PATH = '/zynthian/zynthian-my-data/sounds/categories/'
const CONFIG_PLUGINS = '/zynthian/zynthbox-qml/config/plugins.json'
const CONFIG_CATEGORIES = '/zynthian/zynthbox-qml/config/snd_categories.json'


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

async function getCategoryFromMetadata(filePath) {
  try {        
    const { parseFile,orderTags } = await loadMusicMetadata();
    const metadata = await parseFile(filePath);
    if(metadata && metadata.native['ID3v2.4'])
    {
      const tags = orderTags(metadata.native['ID3v2.4']);  
      return tags['TXXX:ZYNTHBOX_SOUND_CATEGORY'][0];      
    }else{
      return 0;
    }    
  } catch (error) {
    console.error("Error reading metadata:", error.message);
  }
}

async function scanSymlinks(dir, results = []) {
  try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });            
      for (const entry of entries) {             
          const fullPath = path.join(dir, entry.name);                 
          if (entry.isSymbolicLink()) {
              try {
                  // const realPath = await fs.promises.realpath(fullPath);
                 
                  results.push({
                      symlinkPath: fullPath,                                            
                      linkContent: await fs.promises.readlink(fullPath),                     
                  });
                  
                  // Optionally follow symlinks to directories
                  // const stats = await fs.promises.stat(realPath);
                  // if (stats.isDirectory()) {
                  //     await scanSymlinks(realPath, results);
                  // }
              } catch (err) {
                  console.error(`Error processing symlink ${fullPath}:`, err.message);
              }
          } else if (entry.isDirectory()) {
              await scanSymlinks(fullPath, results);
          }
      }
  } catch (err) {
      if (err.code !== 'ENOTDIR') {  // Ignore non-directory errors
          console.error(`Error scanning directory ${dir}:`, err.message);
      }
  }
  return results;
}


exports.initFilesCategories = async (req, res)=>{

  const symlinks = await scanSymlinks(CONFIG_SOUNDS_INDEX_PATH);  
  let folder = req.params.path.split('+++').join('/');     
  const files = symlinks.filter(s => s.linkContent.startsWith(folder));
  const filesList = [];
  files.map(f=>{
        const catId = f.symlinkPath.split('/')[5];
        const file ={
                      name:f.linkContent.split(folder)[1],
                      folder,
                      path:f.linkContent,
                      catId
                  }
        filesList.push(file)   
    })
   
  // sort
  filesList.sort((a, b) => a.name.localeCompare(b.name));
  // group files with catId
  const groupedFiles = filesList.reduce((acc, item) => {    
    // Initialize the category array if it doesn't exist
    if (!acc[item.catId]) {
      acc[item.catId] = [];
    }
    acc[item.catId].push(item);    
    return acc;
  }, {});

  // init categories with cnt of files
  const catList = [];
  const categoryNameMapping = await fsextra.readJson(CONFIG_CATEGORIES);
  Object.keys(categoryNameMapping).map(k=>{
    let cat;
    if(groupedFiles[k]){
        c ={
          catId:k,
          catName:categoryNameMapping[k],
          cntFiles:groupedFiles[k].length
        }
    }else{
       c ={
        catId:k,
        catName:categoryNameMapping[k],
        cntFiles:0
      }
    }
    if(k!='*') catList.push(c);
  })
  return res.status(200).json({files:filesList,categories:catList})    
}

/**
  * @deprecated
  */
exports.initFilesCategories_statJson = async (req, res)=>{

  let folder = req.params.path.split('+++').join('/');   
  let stat;
  const filesList = [];
  try {
      stat = await fsextra.readJson(folder+'.stat.json');      
      const cats = Object.keys(stat);
      cats.map( catId =>{
        const files = stat[catId].files;        
        const fileskeys = Object.keys(files);        
        fileskeys.map(f=>{   
              const fxSlotsData = files[f]['fxSlotsData'];         
              const sampleSlotsData	= files[f]['sampleSlotsData']; 
              const synthSlotsData = files[f]['synthSlotsData']; 
              const file ={
                name:f,
                folder,
                path:`${folder}${f}`,
                catId,
                fxSlotsData,
                sampleSlotsData,
                synthSlotsData              
            }
            filesList.push(file)   
        })
      })
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("File not found:", folder+'.stat.json');
      // file not existing...
    }
    console.error("Error reading JSON file:", error);
    // throw error; // Rethrow if it's a different error
  } 
  
  // group files with catId

  const groupedFiles = filesList.reduce((acc, item) => {    
    // Initialize the category array if it doesn't exist
    if (!acc[item.catId]) {
      acc[item.catId] = [];
    }
    acc[item.catId].push(item);    
    return acc;
  }, {});

  // init categories with cnt of files
  const catList = [];
  const categoryNameMapping = await fsextra.readJson(CONFIG_CATEGORIES);
  Object.keys(categoryNameMapping).map(k=>{
    let cat;
    if(groupedFiles[k]){
        c ={
          catId:k,
          catName:categoryNameMapping[k],
          cntFiles:groupedFiles[k].length
        }
    }else{
       c ={
        catId:k,
        catName:categoryNameMapping[k],
        cntFiles:0
      }
    }
    if(k!='*') catList.push(c);
  })
  return res.status(200).json({files:filesList,categories:catList})    
}

/**
 * @deprecated
 */
exports.initFilesCategories_realSndFiles = async (req, res)=>{

  let folder = req.params.path.split('+++').join('/');       
  let files = fs.readdirSync(folder); 
  files = files.filter(file => !file.startsWith('.')) 
  const filesList = [];
  await Promise.all(
    files.map(async f=>{
        const catId = await getCategoryFromMetadata(folder+f);    
        const file ={
                      name:f,
                      folder,
                      path:`${folder}${f}`,
                      catId
                  }
        filesList.push(file)   
    })
  )
  // group files with catId
  const groupedFiles = filesList.reduce((acc, item) => {    
    // Initialize the category array if it doesn't exist
    if (!acc[item.catId]) {
      acc[item.catId] = [];
    }
    acc[item.catId].push(item);    
    return acc;
  }, {});

  // init categories with cnt of files
  const catList = [];
  Object.keys(categoryNameMapping).map(k=>{
    let cat;
    if(groupedFiles[k]){
        c ={
          catId:k,
          catName:categoryNameMapping[k],
          cntFiles:groupedFiles[k].length
        }
    }else{
       c ={
        catId:k,
        catName:categoryNameMapping[k],
        cntFiles:0
      }
    }
    catList.push(c);
  })
  return res.status(200).json({files:filesList,categories:catList})    
}

const extractTagsFromSound = async (meta,path)=>{
  
  //   [{"isValid": true, "path": "/zynthian/zynthian-my-data/sounds/my-sounds/EightiesMemoriestest.snd"
  // , "synthSlotsData": ["synthv1 > EightiesMemories", "", "", "", ""]
  // , "sampleSlotsData": ["", "", "", "", ""]
  // , "fxSlotsData": ["", "", "", "", ""]
  // , "category": "4"}]
    //  console.log(meta);
     try{
        
        let category = categoryNameMapping[meta['TXXX:ZYNTHBOX_SOUND_CATEGORY'][0]];         
        let sampleSlotsData = ["", "", "", "", ""]
        let samples = ["", "", "", "", ""]
        let synthSlotsData = ["", "", "", "", ""]
        let fxSlotsData =  ["", "", "", "", ""]
        if(meta['TXXX:ZYNTHBOX_SOUND_SAMPLE_SNAPSHOT'][0]){
          let obj = JSON.parse(meta['TXXX:ZYNTHBOX_SOUND_SAMPLE_SNAPSHOT'][0]);                
          let i = 0,j=0;
          Object.values(obj).forEach(o=>{
            sampleSlotsData[i++] = o['filename']
            samples[j++] = o['sampledata']
          })
          
        }
          
        let snapshotObj = JSON.parse(meta['TXXX:ZYNTHBOX_SOUND_SYNTH_FX_SNAPSHOT'][0]);           
        let layers = snapshotObj['layers'];        
        const pluginsNameMapping = await fsextra.readJson(CONFIG_PLUGINS);
        
        layers.forEach((l) => {          
          let mapping;
          if(l['engine_name'].indexOf('_name')>0)
          {          
            const s = l['engine_name'].match(/\{(.*?)\}/)[1];          
            const key = s.split('_name')[0]   
            mapping = pluginsNameMapping[key].name       
          }else{
            mapping = l['engine_name']
          }
          
          if(l['engine_type'] == 'MIDI Synth'){  
              synthSlotsData[l['slot_index']] = mapping +'>'+(l['preset_name']?l['preset_name']:'None')            
          }
          if(l['engine_type'] == 'Audio Effect'){            
              fxSlotsData[l['slot_index']]  = mapping +'>'+(l['preset_name']?l['preset_name']:'None')            
          }
        });
  
        let r = {"isValid":true,path,category,sampleSlotsData,synthSlotsData,fxSlotsData,samples};      
        return r;
      }catch(error)
      {
        console.error(error);
        return {"isValid":false,"erorrString": "Could not open file to read the tags"}
      }
  
  }

exports.snd_metadata_extractor = async(req, res)=>{
  try{
    let snd = req.params.path.split('+++').join('/');     
    const { parseFile,orderTags } = await loadMusicMetadata();
    const metadata = await parseFile(snd);
    if(metadata && metadata.native['ID3v2.4']){
      const orderedTags = orderTags(metadata.native['ID3v2.4']);  
      const data = await extractTagsFromSound(orderedTags,snd);
      return res.status(200).json(data)    
    }else{      
      return res.status(404).json({"isValid":false,"erorrString": "Could not open file to read the tags"})      
    }    
  }catch(err){    
    console.log(err);
    return res.status(404).json({error:err})    
  }
  
}

exports.zynthbox_snd_metadata_extractor =(req, res)=>{
    // python3 /zynthian/zynthbox-qml/zynthbox_snd_metadata_extractor "/zynthian/zynthian-my-data/sounds/my-sounds/EightiesMemoriestest.snd" 
    let snd = req.params.path.split('+++').join('/');     
    exec(`python3 /zynthian/zynthbox-qml/zynthbox_snd_metadata_extractor "${snd}"`, (error, stdout, stderr) => {

        console.log(`>>>> python3 /zynthian/zynthbox-qml/zynthbox_snd_metadata_extractor "${snd}"`);
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }

        const fileinfo = `${stdout}`;
        return res.status(200).json(fileinfo)                       
      });
}

