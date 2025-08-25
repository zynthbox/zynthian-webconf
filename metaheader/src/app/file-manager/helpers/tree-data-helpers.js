
function getTreeChildren(array,folderChain,selectedFolder,parentPath,ROOTDIR){

    let children = [];

    array.forEach(function(item,index){
        if (item.folder === parentPath){
            let newItem = {
                ...item,
                toggled:folderChain.findIndex(fc => fc.path === item.path) > -1 ? true : false,
            }

            if ( ROOTDIR + selectedFolder === item.path){
                newItem.active = true;
            }
    
            if (array.filter(i => i.level > item.level).length > 0){
                newItem.children = getTreeChildren(array.filter(i => i.level > item.level),folderChain,selectedFolder,item.path + "/",ROOTDIR)
            }
    
            children.push(newItem)
        }
    })

    return children;

}

export function generateTreeFromArray(array,folderChain,selectedFolder,rootDirectory,rootName){
   
    let newTreeData = {
        name:rootName,
        toggled:true,
        path:rootDirectory,
        active:selectedFolder === null ? true : false,
        children:getTreeChildren(array,folderChain,selectedFolder,rootDirectory,rootDirectory)
    }
    return newTreeData

}

/*

    list of directories
    create idMapping

*/