const fs = require('fs');

const rootFolder = "/home/pi/zynthian-my-data/"

exports.getSongExports = (req,res) => {
    const sketchesFolder = `${rootFolder}sketchpads/my-sketchpads/`

    fs.readdir(sketchesFolder, (err, sketchFolders) => {
        if (err){
            console.log(err);
            res.json(err)
        } else {
            const exportDirList = [];
            sketchFolders.forEach((sFolder, sFolderIndex) => {
                const folderPath = sketchesFolder + sFolder;
                // console.log(folderPath)
                if (fs.existsSync(folderPath + "/exports")){
                    exportDirList.push({
                        name:"exports",
                        folder:sFolder,
                        path:`${folderPath}/exports`,
                        count: fs.readdirSync(folderPath + "/exports").length
                    })
                }
            })
            res.json(exportDirList)
        }
    })
}