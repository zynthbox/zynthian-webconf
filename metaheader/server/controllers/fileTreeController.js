const fs = require("fs");
const path = require("path");

// Get file structure recursively
const getFileTree = (dirPath,level=1) => {
    return fs.readdirSync(dirPath).map(file => {
        const fullPath = path.join(dirPath, file);        
        const isDirectory = fs.statSync(fullPath).isDirectory();
        if(isDirectory){
            return {
                name: file,
                path: fullPath,
                level:level,
                isDirectory,                        
                children:  getFileTree(fullPath,level+1) 
            }
        }
        else
        {
            const extname = path.extname(fullPath);
            return {
                name: file,
                path: fullPath,
                level:level,
                isDirectory,        
                extname,
                children: []
            };
        }
    });
};

exports.getSketchpadFileTree = (req,res) => {
    const sketchpadDir = '/zynthian/zynthian-my-data/sketchpads/my-sketchpads';
    const tree = getFileTree(sketchpadDir);
    const xtree = {
        name:'my-sketchpads',
        path:sketchpadDir,
        isDirectory:true,
        children:tree,
        level:0
    }
    res.status(200).json(xtree)
}

exports.getMySoundsFileTree = (req,res) => {
    const sketchpadDir = '/zynthian/zynthian-my-data/sounds/my-sounds';
    const tree = getFileTree(sketchpadDir);
    const xtree = {
        name:'my-sounds',
        path:sketchpadDir,
        isDirectory:true,
        children:tree,
        level:0
    }
    res.status(200).json(xtree)
}