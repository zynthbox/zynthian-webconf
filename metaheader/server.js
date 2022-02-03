const express = require('express')
const path = require("path")
const fs = require('fs');
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
        path:path.join(__dirname, dirPath, "/", file)
      }
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

app.get('/', (req, res) => {
  res.send('Webconf Metaheader Files App Server!')
})

app.get('/mydata',(req,res) => {
  const dirList = getAllFiles('/home/pi/zynthian-my-data/',[])
  console.log(dirList)
  res.json(dirList)
})

app.listen(port, () => {
  console.log(`webconf metaheader file-browser app-server listening on port ${port}`)
})