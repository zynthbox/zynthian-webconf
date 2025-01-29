
const fs = require('fs');
const openmpt = require('../lib/libopenmpt.js');
const { exec } = require('child_process');
const { readdirSync, rmSync } = require('fs');
const path = require("path")
var multer = require('multer');

const destFolder = '/home/pi/zynthian-my-data/tmp/webconf/tracker/uploads/';
var storage = multer.diskStorage({
      destination: function (req, file, cb) {            
            if (!fs.existsSync(destFolder)) {
              fs.mkdirSync(destFolder,{ recursive: true });
            }
            // empty temp folder
            readdirSync(destFolder).forEach(f => rmSync(`${destFolder}/${f}`,{recursive: true, force: true}));
            cb(null, destFolder);      
      },
      filename: function (req, file, cb) {
            // const fileExtension = path.extname(file.originalname);
            cb(null, file.originalname)            
      }
    })
    
var upload = multer({ storage: storage,   limits: { fieldSize: 25 * 1024 * 1024 }  }).fields([{name:'file',maxCount:100}])

const uploadMemory = multer({storage: multer.memoryStorage()})

// try to use libopenmpt.js read samples
// // const modFile = fs.readFileSync('./music/sample.mod');
// // exports.getTrackerInfo = (req,res) => {
  
// //   openmpt().then((Module)=>{
// //      const mod = new Module.Module(modFile);
// //      console.log('title:',mod.get_metadata('title'));
// //   })

//   return res.status(200).json({message:'fileinfo',samples:[],path:'path'}) 
// }



 exports.getTrackerInfo = (req,res) => {
      
      const filepath = destFolder+req.params.folder;
      upload(req, res, function (err) {   
            
            if (err instanceof multer.MulterError) {
              console.log(err);
                return res.status(500).json(err)
            } else if (err) {
              console.log(err);
                return res.status(500).json(err)
            }
                        
            // get tracker info           
            exec(`openmpt123 --info ${filepath}`, (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                return;
              }
              if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
              }

              const fileinfo = `${stdout.substring(stdout.indexOf('Filename...'))}`;
              let samples;
              // run ./xmodits to extract samples
              exec(`xmodits ${filepath} ${destFolder}`, (error, stdout, stderr) => {
                  if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                  }
                  if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                  }   
                  // read files from destFold/firstDirectory                          
                  const files = fs.readdirSync(destFolder);  
                  let path;                
                  files.forEach(function(file) {
                    // find extract folder
                    if (fs.statSync(`${destFolder}/${file}`).isDirectory()) {
                      samples = fs.readdirSync(`${destFolder}/${file}`);  
                      path = file;                                                                                 
                    }
                  })    
                  
                  return res.status(200).json({message:fileinfo,samples:samples,path:path}) 
              });    
                            
            });
            
          })              
  }

  exports.playSample = (req,res)=>{
    if (req.params.folder){
      folder = req.params.folder;     
      if (folder.indexOf('+++') > -1) folder = folder.split('+++').join('/');
      const url = destFolder+folder;
      // send_osc 1370 /CUIA/PLAY_WAVE_FILE 
      console.log('play samples.....',url);
      const cmd = 'send_osc 1370 /CUIA/PLAY_WAVE_FILE '+url;
      // exec(cmd, (error, stdout, stderr) => {
      //   if (error) {
      //     console.error(`exec error: ${error}`);
      //     return;
      //   }
      //   if (stderr) {
      //     console.error(`stderr: ${stderr}`);
      //     return;
      //   }
      // })      
    }
    
  }