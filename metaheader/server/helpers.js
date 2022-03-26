const path = require("path")
const fs = require('fs');

exports.getAllFiles = function(dirPath, arrayOfFiles,index) {
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