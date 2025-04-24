
const fs = require('fs');
const fsextra = require('fs-extra');
const { exec } = require('child_process');
const { readdirSync, rmSync } = require('fs');
const path = require("path")
var multer = require('multer');
const libopenmptModule = require('./libs/libopenmpt.js');
var filesController = require('./filesController.js');

// async function loadLibOpenMPT() {
//   const libopenmptModule = await import(path.resolve(__dirname, "./libs/libopenmpt.js"));
//   return new Promise((resolve) => {
//       libopenmptModule({
//           locateFile: (file) => path.resolve(__dirname, "libs", file), // Correct WASM path
//           onRuntimeInitialized: function () {
//               console.log(" libopenmpt.js initialized!");
//               resolve(this);
//           },
//       });
//   });
// }

exports.getTrackerInfoTest = (req,res) => {
  // const moduleBuffer = fs.readFileSync('/home/siyuan/workspace/zynthian-webconf/metaheader/server/controllers/samples/sample.mod');

  // Run and check if libopenmpt initializes
  // loadLibOpenMPT().then(() => {
  //   console.log("🎵 libopenmpt is ready to use!");
  // }).catch((err) => {
  //   console.error("❌ Error loading libopenmpt.js:", err);
  // });
  // return res.status(200).json({message:'fileinfo',samples:[],path:'path'}) 
}


const destFolder = '/zynthian/zynthian-my-data/tmp/webconf/tracker/uploads/';
var storage = multer.diskStorage({
      destination: function (req, file, cb) {            
            if (!fs.existsSync(destFolder)) {
              fs.mkdirSync(destFolder,{ recursive: true });
            }
            // empty temp folder
            // fsextra.remove(destFolder);
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
// const modFile = fs.readFileSync('./music/sample.mod');
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

              console.log(`openmpt123 --info ${filepath}`);
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

 // write to fifo
  exports.playSample = (req,res)=>{    
      folder = req.params.folder;     
      if (folder.indexOf('+++') > -1) folder = folder.split('+++').join('/');
      const url = destFolder+folder;
      const msg= {"category":"cuia","command":"PLAY_WAVE_FILE","params":[url]}
      filesController.fnWriteMsgToFIFO(JSON.stringify(msg));      
      console.log('play samples.....',msg);
      return res.status(200).json(msg)            
  }
  exports.stopSample = (req,res)=>{    
    const msg= {"category":"cuia","command":"STOP_WAVE_FILE"}
    filesController.fnWriteMsgToFIFO(JSON.stringify(msg));      
    console.log('stop sample.....',msg);
    return res.status(200).json(msg)            
  }

  // deprecated
  exports.playSample_ = (req,res)=>{
    if (req.params.folder){
      folder = req.params.folder;     
      if (folder.indexOf('+++') > -1) folder = folder.split('+++').join('/');
      const url = destFolder+folder;
      // send_osc 1370 /CUIA/PLAY_WAVE_FILE 
      
      const cmd = 'send_osc 1370 /CUIA/PLAY_WAVE_FILE "'+url+'"';
      console.log('play samples.....',cmd);
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
      })      
    }
    
  }