const express = require('express')
const path = require("path")
const fs = require('fs');
const glob = require("glob");
const app = express()
const port = 3000
var cors = require('cors');

// cors
app.use(cors());

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (file !== "node_modules"){
      let fileData = {
        name:path.join(__dirname, dirPath, "/", file)
      }
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles.push(fileData)
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      } else {
        var stats = fs.statSync(dirPath + "/" + file)
        fileData = {
          size:stats.size,
          modDate:stats.ctimeMs,
          name:path.join(__dirname, dirPath, "/", file),
        }
        arrayOfFiles.push(fileData)
      }
    }
  })

  return arrayOfFiles
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

  app.get('/playgrids',(req,res) => {
    const dirList = getAllFiles('/home/pi/zynthian-my-data',[])
    console.log(dirList)
    res.json(dirList)
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})