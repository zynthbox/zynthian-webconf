const fs = require('fs');
const path = require("path")

// var zipFolder = require('zip-folder');
var rimraf = require("rimraf");
var multer = require('multer');
const { exec } = require('child_process');

// const rootFolder = "./"
// const rootFolder = "/home/pi/zynthian-my-data/"
// const parentFolder = "/home/pi"

const rootFolder = "/zynthian/zynthian-my-data/"
const parentFolder = "/zynthian"

const SOUNDS_DIR = '/zynthian/zynthian-my-data/sounds/';
const SOUNDFONTS_DIR = '/zynthian/zynthian-my-data/soundfonts/';

const excludedFolders = [
  "sf2",
  "compile",
  "jpmidi"
]

const getAllFiles = function(dirPath, arrayOfFiles,index) {
  // console.timeLog()
  try{

      files = fs.readdirSync(dirPath)
      arrayOfFiles = arrayOfFiles || []
      index = index || 0
      files.forEach(function(file) {
        if (file !== "node_modules"){
          index++;
          let fileData = {
            path:path.join(__dirname, dirPath, "/", file),
            id:index
          }
          fileData.path = rootFolder + fileData.path.split(rootFolder)[1]
          if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
            if (excludedFolders.indexOf(file) === -1){
              arrayOfFiles.push(fileData)
              arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
            }
          } else {
            // if (file.indexOf('*') === -1){
              var stats = fs.statSync(`${dirPath}/${file}`)
              fileData.size = stats.size
              fileData.modDate = stats.ctimeMs
            // }
            arrayOfFiles.push(fileData)
          }
        }
      })
    return arrayOfFiles
  }catch(e)
  {
    console.log(e);
    return [] 
  }
}

exports.getAllFiles = (req,res) => {

  let folder = rootFolder;
  if (req.params.folder){
    folder = req.params.folder;
    if (folder.indexOf('+++') > -1) folder = folder.split('+++').join('/');
  }
  const dirList = getAllFiles(folder,[])
  res.json(dirList)
}

exports.getFilesInFolder = (req,res) => {
  
  let folder = req.params.folder;
  if (!folder) folder = "/"
  else if (folder.indexOf('+++') > -1) folder = folder.split('+++').join('/');

  fs.readdir(folder,{ withFileTypes: true }, (err, files) => {
    if (err){
      console.log(err);
      res.json(err)
    } else {
      const filesList = [];
      files.forEach(file => {     
        const isHidden = file.name.startsWith('.');
        const isSymlink = file.isSymbolicLink?.();
        if (!isHidden && !isSymlink) {
          var stats = fs.statSync(`${folder}${file.name}`)        
          const f = {
            size:stats.size,
            modDate:stats.ctimeMs,
            name:file.name,
            folder,
            path:`${folder}${file.name}`,
            isDir:fs.statSync(folder + file.name).isDirectory(),
            level:folder.match(/\//g).length - 2
          }
          if (f.isDir === true) f.count = fs.readdirSync(folder + file.name).length
          filesList.push(f)
        }
       
      })
      res.json(filesList)
    }
  })

}

exports.getJsonFile = (req,res) => {
  const filePath = req.params.path.split('+++').join('/');
  let rawdata = fs.readFileSync(filePath);
  let json = JSON.parse(rawdata);
  res.json(json)
}

/* RENAME FILE / FOLDER */

exports.renameFile = (req,res) => {
  const { previousPath, fullPath } = req.body;
  try {
    fs.renameSync(previousPath,fullPath)
    // const dirList = getAllFiles(rootFolder,[])
    res.status(200).json({message:'Rename successful!'})
  } catch(err) {
    console.error(err)
    res.json({error:err})
  }
}

/* /RENAME FILE / FOLDER */

/* CREATE FOLDER */

exports.createFolder = (req,res) => {
  const { fullPath } = req.body;
  console.log('>>>>>>>>>>>>>>>createFolder:',fullPath)
  try {
    // if (!fs.existsSync(parentFolder + "/" + fullPath)) {
    //   fs.mkdirSync(parentFolder + "/" +  fullPath)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath)
      res.status(200).json({message:'Folder created!'})
    } else {
      res.json({message:'Folder already exists!'})
    }
  } catch (err) {
    console.error(err)
    res.json({error:err})
  }
}

/* CREATE FOLDER */

/* DELETE FILES / FOLDERS */

const deleteFiles = (req,res) => {

  const { fullPath } = req.body;
  try {
    if (fs.statSync(fullPath).isDirectory()) {
      rimraf.sync(fullPath);
    } else {
      fs.unlinkSync(fullPath)
      //process sounds
      if(fullPath.startsWith(SOUNDS_DIR)){
        fnProcessSound(fullPath);
      }
    }
    // const dirList = getAllFiles(rootFolder,[])
    res.status(200).json({message:"Delete successfull!"})
    //file removed
  } catch(err) {
    console.error(err)
    res.json({error:err})
  }
}

exports.deleteFiles = (req,res) => {
  deleteFiles(req,res);
}

/* /DELETE FILES / FOLDERS */

/* COPY FILES / FOLDERS */

function copyFileSync( source, target ) {

  console.log('>>>>>>>>>>>>>>>>copyFileSync target:',target)
  var targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if ( fs.existsSync( target ) ) {
      if ( fs.lstatSync( target ).isDirectory() ) {
          targetFile = path.join( target, path.basename( source ) );
      }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target ) {
  var files = [];

  // Check if folder needs to be created or integrated
  var targetFolder = path.join( target, path.basename( source ) );
  if ( !fs.existsSync( targetFolder ) ) {
      fs.mkdirSync( targetFolder );
  }

  // Copy
  if ( fs.lstatSync( source ).isDirectory() ) {
      files = fs.readdirSync( source );
      files.forEach( function ( file ) {
          var curSource = path.join( source, file );
          if ( fs.lstatSync( curSource ).isDirectory() ) {
              copyFolderRecursiveSync( curSource, targetFolder );
          } else {
              copyFileSync( curSource, targetFolder );
          }
      } );
  }
}

// function safeCopyFile(previousPath, fullDestinationPath) {
//   const dir = path.dirname(fullDestinationPath);
//   const ext = path.extname(fullDestinationPath);
//   const baseName = path.basename(fullDestinationPath, ext);

//   let finalPath = fullDestinationPath;

//   if (fs.existsSync(fullDestinationPath)) {
//     finalPath = dir+'/'+ getAvailableFileName(dir, baseName, ext);   
//   }

//   fs.copyFileSync(previousPath, finalPath);
//   return finalPath; 
// }

function getAvailableFilePath(fullDestinationPath){
  const dir = path.dirname(fullDestinationPath);
  const ext = path.extname(fullDestinationPath);
  const baseName = path.basename(fullDestinationPath, ext);
  let finalPath = fullDestinationPath;
  if (fs.existsSync(fullDestinationPath)) {
    finalPath = dir+'/'+ getAvailableFileName(dir, baseName, ext);   
  }
  return finalPath; 
}

exports.copyPaste = (req,res) => {

  const { previousPath, destinationPath,deleteOrigin, newName } = req.body;

  // console.log(previousPath, " PREVIOUS PATH")
  // console.log(destinationPath, " DESTINATION PATH")

  try {

    // console.log(fs.existsSync(parentFolder + destinationPath), "DESTINATION PATH IS EXISTS ")
    const fullDestinationPath = parentFolder + destinationPath;
    if (fs.statSync(previousPath).isDirectory()) {      
      copyFolderRecursiveSync(previousPath, fullDestinationPath)
    } else {      
      const dpath = getAvailableFilePath(fullDestinationPath);    
      fs.copyFileSync(previousPath, dpath)   
      
      // if sound directory do process sound 
      if(dpath.startsWith(SOUNDS_DIR)){
        fnProcessSound(dpath)
      };
      
    }

    if (deleteOrigin === true){

      try {
        if (fs.statSync(previousPath).isDirectory()) {
          rimraf.sync(previousPath);
        } else {
          fs.unlinkSync(previousPath)
        }
        // const dirList = getAllFiles(rootFolder,[])
        res.status(200).json({message:"Copy successfull!"})  
        //file removed
      } catch(err) {
        console.error(err)
        res.json({error:err})
      }

    } else {
      // const dirList = getAllFiles(rootFolder,[])
      // res.json(dirList)
      res.status(200).json({message:"copyPaste successfull!"})
    }
  } catch(err) {
    console.error(err)
    res.json({error:err})
  }

}

/* /COPY FILES / FOLDERS */

/* UPLOAD FILES */


const getAvailableFileName = (dir, base, ext, count = 0) => {
  const name = count === 0 ? `${base}${ext}` : `${base}(${count})${ext}`;
  const fullPath = path.join(dir, name);
  if (!fs.existsSync(fullPath)) {
    return name;
  }
  return getAvailableFileName(dir, base, ext, count + 1);
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const selectedFolder = req.params.folder.split('+++').join('/');    
      cb(null, selectedFolder)
  },
  filename: function (req, file, cb) {       
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const dir = req.params.folder.split('+++').join('/');   
    const finalName = getAvailableFileName(dir, base, ext);
    cb(null, finalName);
  }
})

// old code 
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//       const selectedFolder = req.params.folder.split('+++').join('/');
//       const folderChainArray = selectedFolder.split('/');
//       let fc = ""
//       for (var i in folderChainArray){
//         if (i < folderChainArray.length - 1){
//           var currentFolder = folderChainArray[i];
//           fc +=  currentFolder + "/"
//           fs.mkdirSync( parentFolder + "/" + fc, {recursive:true})  
//         }
//       }
//       cb(null, parentFolder)
//   },
//   filename: function (req, file, cb) {
//     const selectedFolder = req.params.folder.split('+++').join('/');
//     cb(null, selectedFolder + file.originalname )
//   }
// })

const  fileFilter = (req, file, cb) => {
  console.log('>>>>>>>>>>>>>>>>>>>filesController fileFilter do filetype check ',file); // See if anything is there
  console.log('>>>>>>>>>>>>>>>>>>>req.params:',req.params); //  { folder: '+++zynthian+++zynthian-my-data+++sketchpads++++++' }  
                                                            // req.params.folder.split('+++').join('/');
  /** TODO: server side file type check. according foldername to define allowed types. DIRECTORIES */
  cb(null, true);
  // For example, get allowed types from request header, query or body
  // const allowed = req.allowedTypes; // fallback
  // if (allowed.includes(file.mimetype)) {
  //   cb(null, true);
  // } else {
  //   cb(new Error(`File type ${file.mimetype} not allowed`), false);
  // }  
};

var upload = multer({ storage: storage, fileFilter, limits: { fieldSize: 25 * 1024 * 1024 }  }).fields([{name:'file',maxCount:100}])

exports.uploadFiles = (req, res) => {   
  upload(req, res, function (err) {    

    if (err instanceof multer.MulterError) {
      console.log(err);
        return res.status(500).json(err)
    } else if (err) {
      console.log(err);
        return res.status(500).json(err)
    }

    const file = req.files?.file?.[0];
    if(file.path.startsWith(SOUNDFONTS_DIR)){
          // do convert .sf2 to .sf3
          const ext = path.extname(file.originalname).toLowerCase();    
          if (ext === '.sf2') {      
            const sf3Path = path.join(
              path.dirname(file.path),
              path.basename(file.path, path.extname(file.path)) + '.sf3'
            );        
            exec(`sf3convert -z "${file.path}"  "${sf3Path}"`, (err, stdout, stderr) => {
              if (err) {
                console.error('Conversion error:', stderr);
                return res.status(500).send('Failed to convert file');
              }        
              fs.unlinkSync(file.path);
              return res.status(200).json({message:"Upload successfull!"})
            });
          }else{
            return res.status(200).json({message:"Upload successfull!"})
          }
    }else if(file.path.startsWith(SOUNDS_DIR)){
      // do write to FIFO to process sound symlink      
      fnProcessSound(file.path)
      return res.status(200).json({message:"Upload successfull!"})
    }else{
      return res.status(200).json({message:"Upload successfull!"})
    }
    
    

  })
}

/* UPLOAD FILES */

/* DOWNLOAD FILES / ZIP FOLDER & DOWNLOAD */

var archiver = require('archiver');

function zipFolder(srcFolder, zipFilePath, callback) {
	var output = fs.createWriteStream(zipFilePath);
	var zipArchive = archiver('zip');

	output.on('close', function() {
		callback();
	});

	zipArchive.pipe(output);

	zipArchive.bulk([
		{ cwd: srcFolder, src: ['**/*'], expand: true, dot:true}
	]);

	zipArchive.finalize(function(err, bytes) {
		if(err) {
			callback(err);
		}
	});
}

exports.downloadFiles = (req,res) => {
  
  const { filePath } = req.body;

  if (fs.statSync(filePath).isDirectory()){

    // console.log(filePath," filePath")

    const folderName = filePath.split('/')[filePath.split("/").length - 1];
    // console.log(folderName,"folder name")
    
    const folderPath = filePath.split(folderName)[0];
    // console.log(folderPath, "folder path ")
    
    const zipFilePath = "/home/pi/" + folderName + ".zip";
    // console.log(zipFilePath, "zipFilePath")

    const tempZipFolder = "/home/pi/zip-temp/"

    fs.mkdirSync( tempZipFolder, {recursive:true})
    copyFolderRecursiveSync(filePath, tempZipFolder)

    zipFolder(tempZipFolder, zipFilePath, function(err) {

        if(err) {
            console.log('zipping error')
            console.log(err);
        } else {

          res.download(zipFilePath,function(err){
            if (err){
              console.log('download error')
              console.log(err)
            } else {
              fs.unlinkSync(zipFilePath)
              rimraf.sync(tempZipFolder);
            }
          })            
        }

    });

  } else {
    
    // var file = fs.readFileSync(filePath, 'binary');
    // var stats = fs.statSync(filePath)
    // res.setHeader('Content-Length', stats.size);
    // // res.setHeader('Content-Type', 'audio/mpeg');
    // console.log(filePath)
    // res.setHeader('Content-Disposition', 'attachment; filename='+filePath.split("/")[filePath.split("/").length - 1]);
    // res.write(file, 'binary');
    // res.end();

    //For large files, avoid readFileSync
    const fileStream = fs.createReadStream(filePath);
    const stats = fs.statSync(filePath);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    fileStream.pipe(res);
  }

}



/* /DOWNLOAD FILES */
function fnProcessSound(filePath){
  const msg= { "category": "sounds", "command": "process", "params": [filePath] }    
  fnWriteMsgToFIFO(JSON.stringify(msg));
}
exports.fnWriteMsgToFIFO = (msg)=>{
// function fnWriteMsgToFIFO(msg){
  const FIFO_WRITES_TO = '/tmp/webconf-writes-to-this-fifo'
  const writeStream = fs.createWriteStream(FIFO_WRITES_TO);
  const message = msg+'\n';
  writeStream.write(message, (err) => {
      if (err) {
          console.error('Error writing to FIFO:', err);
      } else {
          console.log('Message written to FIFO',message);
      }
      writeStream.end();
  });

  writeStream.on('finish', () => {
      console.log('Write stream closed');
  });
}

exports.writeToFIFO = (req,res) => {
  const { msg } = req.body;
  try {
    fnWriteMsgToFIFO(msg);

    // const FIFO_WRITES_TO = '/tmp/webconf-writes-to-this-fifo'
    // const writeStream = fs.createWriteStream(FIFO_WRITES_TO);
    // const message = msg+'\n';
    // writeStream.write(message, (err) => {
    //     if (err) {
    //         console.error('Error writing to FIFO:', err);
    //     } else {
    //         console.log('Message written to FIFO');
    //     }
    //     writeStream.end();
    // });

    // writeStream.on('finish', () => {
    //     console.log('Write stream closed');
    // });

    return res.status(200).json({message:msg+" writeToFIFO successfull!"})
  } catch(err) {
    console.error(err)
    res.json({error:err})
  }

}