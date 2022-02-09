const express = require('express')
const path = require("path")
const fs = require('fs');
const fse = require('fs-extra');
var rimraf = require("rimraf");
var cors = require('cors');

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
  res.send('Webconf Metaheader Files App Server!')
})

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

app.post('/delete',(req,res) => {
  const { fullPath } = req.body;
  try {
    if (fs.statSync(fullPath).isDirectory()) {
      rimraf.sync(fullPath);
    } else {
      fs.unlinkSync(adjusfullPathtedPath)
    }
    const dirList = getAllFiles(rootFolder,[])
    res.json(dirList)  
    //file removed
  } catch(err) {
    console.error(err)
    res.json({error:err})
  }
})

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
 
app.post('/paste',(req,res) => {
  const { previousPath, destinationPath } = req.body;
  try {
    if (fs.statSync(previousPath).isDirectory()) {
      console.log(previousPath, parentFolder + destinationPath)
      copyFolderRecursiveSync(previousPath, parentFolder + destinationPath)
    } else {
      fs.copyFileSync(previousPath, parentFolder + destinationPath)
    }
    const dirList = getAllFiles(rootFolder,[])
    res.json(dirList)
  } catch(err) {
    console.error(err)
    res.json({error:err})
  }

})


app.listen(port, () => {
  console.log(`webconf metaheader file-browser app-server listening on port ${port}`)
})