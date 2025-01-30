import { ROOTDIR } from "./settings.js";

function getTreeChildren(array,folderChain,selectedFolder,parentPath){

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
                newItem.children = getTreeChildren(array.filter(i => i.level > item.level),folderChain,selectedFolder,item.path + "/")
            }
    
            children.push(newItem)
        }
    })

    return children;

}

export function generateTreeFromArray(array,folderChain,selectedFolder){
   
    let newTreeData = {
        name:'My Sketchpads',
        toggled:true,
        path:ROOTDIR,
        active:selectedFolder === null ? true : false,
        children:getTreeChildren(array,folderChain,selectedFolder,ROOTDIR)
    }
    return newTreeData

}

/*

    list of directories
    create idMapping

*/