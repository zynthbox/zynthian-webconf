const express = require('express')
const path = require("path")
const fs = require('fs');
var rimraf = require("rimraf");
var cors = require('cors');
var multer = require('multer')

const app = express()
const port = 3000

// const rootFolder = "./"
const rootFolder = "/home/pi/zynthian-my-data/"
const parentFolder = "/home/pi"

// cors
app.use(cors());

// Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Webconf Files Manager App Server.')
})

/* GET FILES */

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

app.get('/mydata',(req,res) => {
  const dirList = getAllFiles(rootFolder,[])
  res.json(dirList)
})

/* /GET FILES */

/* RENAME FILE / FOLDER */

app.post('/rename',(req,res) => {
  const { previousPath, fullPath } = req.body;
  try {
    fs.renameSync(previousPath,fullPath)
    const dirList = getAllFiles(rootFolder,[])
    res.json(dirList)
  } catch(err) {
    console.error(err)
    res.json({error:err})
  }
})


/* /RENAME FILE / FOLDER */

/* CREATE FOLDER */

app.post('/createfolder',(req,res) => {
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
})

/* CREATE FOLDER */

/* DELETE FILES / FOLDERS */

app.post('/delete',(req,res) => {
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
})

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
 
app.post('/copypaste',(req,res) => {

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

})

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

var upload = multer({ storage: storage }).single('file')

app.post('/upload/:folder', (req, res) => {

  upload(req, res, function (err) {
    console.log(err);
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
    } else if (err) {
        return res.status(500).json(err)
    }
    const dirList = getAllFiles(rootFolder,[])
    
    return res.status(200).json(dirList)

  })
});

/* UPLOAD FILES */

app.post('/download',(req,res) => {

  const { filePath } = req.body;
  var file = fs.readFileSync(filePath, 'binary');
  var stats = fs.statSync(filePath)
  res.setHeader('Content-Length', stats.size);
  // res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', 'attachment; filename='+filePath.split("/")[filePath.split("/").length - 1]);
  res.write(file, 'binary');
  res.end();

})

app.listen(port, () => {
  console.log(`webconf metaheader file-browser app-server listening on port ${port}`)
})