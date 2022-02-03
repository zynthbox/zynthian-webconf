const express = require('express')
const path = require("path")
const fs = require('fs');
const glob = require("glob");
const app = express()
const port = 3000


const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/playgrids',(req,res) => {
    const dirList = getAllFiles('/root/.local/share/zynthian/playgrids/',[])
    console.log(dirList)
    res.send(dirList)
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})