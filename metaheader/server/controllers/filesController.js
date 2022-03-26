const fs = require('fs');
const path = require("path")

var zipFolder = require('zip-folder');
var rimraf = require("rimraf");
var multer = require('multer')

// const rootFolder = "./"
const rootFolder = "/home/pi/zynthian-my-data/"
const parentFolder = "/home/pi"

const getAllFiles = function(dirPath, arrayOfFiles,index) {
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
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles.push(fileData)
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      } else {
        var stats = fs.statSync(dirPath + "/" + file)
        fileData.size = stats.size
        fileData.modDate = stats.ctimeMs
        arrayOfFiles.push(fileData)
      }
    }
  })

  return arrayOfFiles
}

exports.getAllFiles = (req,res) => {
      const dirList = getAllFiles(rootFolder,[])
      res.json(dirList)
}

/* RENAME FILE / FOLDER */

exports.renameFile = (req,res) => {
  const { previousPath, fullPath } = req.body;
  try {
    fs.renameSync(previousPath,fullPath)
    const dirList = getAllFiles(rootFolder,[])
    res.json(dirList)
  } catch(err) {
    console.error(err)
    res.json({error:err})
  }
}

/* /RENAME FILE / FOLDER */

/* CREATE FOLDER */

exports.createFolder = (req,res) => {
  const { fullPath } = req.body;
  try {
    if (!fs.existsSync(parentFolder + fullPath)) {
      fs.mkdirSync(parentFolder + fullPath)
      const dirList = getAllFiles(rootFolder,[])
      res.json(dirList)
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
    }
    const dirList = getAllFiles(rootFolder,[])
    res.json(dirList)
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

exports.copyPaste = (req,res) => {

  const { previousPath, destinationPath,deleteOrigin } = req.body;
  // console.log( previousPath, destinationPath,deleteOrigin )
  try {

    if (fs.statSync(previousPath).isDirectory()) {
      copyFolderRecursiveSync(previousPath, parentFolder + destinationPath)
    } else {
      fs.copyFileSync(previousPath, parentFolder + destinationPath)
    }

    if (deleteOrigin === true){

      try {
        if (fs.statSync(previousPath).isDirectory()) {
          rimraf.sync(previousPath);
        } else {
          fs.unlinkSync(previousPath)
        }
        const dirList = getAllFiles(rootFolder,[])
        res.json(dirList)  
        //file removed
      } catch(err) {
        console.error(err)
        res.json({error:err})
      }

    } else {
      const dirList = getAllFiles(rootFolder,[])
      res.json(dirList)
    }
  } catch(err) {
    console.error(err)
    res.json({error:err})
  }

}

/* /COPY FILES / FOLDERS */

/* UPLOAD FILES */

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, parentFolder)
  },
  filename: function (req, file, cb) {
    const selectedFolder = req.params.folder.split('+++').join('/');
    cb(null, selectedFolder + "/" + file.originalname )
  }
})

var upload = multer({ storage: storage,   limits: { fieldSize: 25 * 1024 * 1024 }  }).fields([{name:'file',maxCount:100}])

exports.uploadFiles = (req, res) => {
  // console.log(req.body);
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log(err);
        return res.status(500).json(err)
    } else if (err) {
      console.log(err);
        return res.status(500).json(err)
    }
    const dirList = getAllFiles(rootFolder,[])
    return res.status(200).json(dirList)
  })
}

/* UPLOAD FILES */

/* DOWNLOAD FILES / ZIP FOLDER & DOWNLOAD */

exports.downloadFiles = (req,res) => {
  
  const { filePath } = req.body;

  if (fs.statSync(filePath).isDirectory()){
          
    const folderName = filePath.split('/')[filePath.split("/").length - 1];
    // console.log(folderName,"folder name")
    
    const folderPath = rootFolder + filePath.split("/")[filePath.split("/").length - 1];
    // console.log(folderPath, "folder path ")
    
    const zipFilePath = folderPath.split(folderName)[0] + folderName + ".zip";
    // console.log(zipFilePath, "zipFilePath")

    zipFolder(folderPath, zipFilePath, function(err) {

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
            }
          })            
        }

    });

  } else {

    var file = fs.readFileSync(filePath, 'binary');
    var stats = fs.statSync(filePath)
    res.setHeader('Content-Length', stats.size);
    // res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename='+filePath.split("/")[filePath.split("/").length - 1]);
    res.write(file, 'binary');
    res.end();

  }

}

/* /DOWNLOAD FILES */
