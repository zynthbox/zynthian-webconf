const express = require('express')
const path = require("path")
const fs = require('fs');
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

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []
  files.forEach(function(file) {
    if (file !== "node_modules"){
      let fileData = {
        path:path.join(__dirname, dirPath, "/", file)
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
  cons
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

app.post('/paste',(req,res) => {
  const { previousPath, destinationPath } = req.body;
  try {
    if (fs.statSync(previousPath).isDirectory()) {
      rimraf.sync(previousPath);
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