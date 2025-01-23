const fs = require('fs');
const path = require("path")

// var zipFolder = require('zip-folder');
var rimraf = require("rimraf");
var multer = require('multer');

// const rootFolder = "./"
const rootFolder = "/home/pi/zynthian-my-data/"
const parentFolder = "/home/pi"

const excludedFolders = [
  "sf2",
  "compile",
  "jpmidi"
]

const getAllFiles = function(dirPath, arrayOfFiles,index) {
  // console.timeLog()
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

  fs.readdir(folder, (err, files) => {
    if (err){
      console.log(err);
      res.json(err)
    } else {
      const filesList = [];
      files.forEach(file => {
        var stats = fs.statSync(`${folder}${file}`)
        const f = {
          size:stats.size,
          modDate:stats.ctimeMs,
          name:file,
          folder,
          path:`${folder}${file}`,
          isDir:fs.statSync(folder + file).isDirectory(),
          level:folder.match(/\//g).length - 2
        }
        if (f.isDir === true) f.count = fs.readdirSync(folder + file).length
        filesList.push(f)
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

  try {
    if (!fs.existsSync(parentFolder + "/" + fullPath)) {
      fs.mkdirSync(parentFolder + "/" +  fullPath)
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

  const { previousPath, destinationPath,deleteOrigin, newName } = req.body;

  console.log(previousPath, " PREVIOUS PATH")
  console.log(destinationPath, " DESTINATION PATH")

  try {

    // console.log(fs.existsSync(destinationPath), "DESTINATION PATH IS EXISTS ")

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
        // const dirList = getAllFiles(rootFolder,[])
        res.status(200).json({message:"Copy successfull!"})  
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
      const selectedFolder = req.params.folder.split('+++').join('/');
      const folderChainArray = selectedFolder.split('/');
      let fc = ""
      for (var i in folderChainArray){
        if (i < folderChainArray.length - 1){
          var currentFolder = folderChainArray[i];
          fc +=  currentFolder + "/"
          fs.mkdirSync( parentFolder + "/" + fc, {recursive:true})  
        }
      }
      cb(null, parentFolder)
  },
  filename: function (req, file, cb) {
    const selectedFolder = req.params.folder.split('+++').join('/');
    cb(null, selectedFolder + file.originalname )
  }
})

var upload = multer({ storage: storage,   limits: { fieldSize: 25 * 1024 * 1024 }  }).fields([{name:'file',maxCount:100}])

exports.uploadFiles = (req, res) => {      
  upload(req, res, function (err) {   
    if (err instanceof multer.MulterError) {
      console.log(err);
        return res.status(500).json(err)
    } else if (err) {
      console.log(err);
        return res.status(500).json(err)
    }
    return res.status(200).json({message:"Upload successfull!"})
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
