// import { ROOTDIR } from "./settings.js";

export function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].path === a[j].path)
                a.splice(j--, 1);
        }
    }
    return a;
}

export function generateNewFolderChain(path,files,rootDirectory){
    let folderChain = [];    
    let newPath = rootDirectory;
    const pathsArray = path.split('/');
    for (var i = 0; i < pathsArray.length; i++){
        let fc = files.filter(file => file.path === newPath + pathsArray[i])[0];
        folderChain.push({
            ...fc,
            id: fc.folder + fc.name
        });
        newPath += pathsArray[i] + "/";
    }
    return folderChain;
}