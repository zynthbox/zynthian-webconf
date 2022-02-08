import React, { useState, useEffect } from 'react'
import WebconfFileBrowser from './file-browser';
import TreeView from './tree-view';

const FileManager = () => {

    // console.log(window.location)
    // const rootFolder = "metaheader"

    const rootFolder = "/zynthian-my-data"
    const fsep = "/";

    const [ files, setFiles ] = useState([])
    // console.log(files,"files")
    const [ displayedFiles, setDisplayedFiles ] = useState([])
    // console.log(displayedFiles,"displayed files")
    const [ folderChain, setFolderChain ] = useState([{ id: 'xcv', name: rootFolder, isDir: true }])
    const [ selectedFolder, setSelectedFolder ] = useState(rootFolder)

    const [ treeData, setTreeData ] = useState(null);
  
    useEffect(() => {
        getFiles()
    }, []);

    useEffect(() => {
        getDisplayFiles(files)
    },[selectedFolder])

    useEffect(() => {
        if (files.length > 0) generateTreeViewData()
    },[files])

    // useEffect(() => {

    // },[folderChain])

    async function getFiles(){
        const response = await fetch(`http://${window.location.hostname}:3000/mydata`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        });
        const res = await response.json();
        setFiles(res);
        setSelectedFolder(rootFolder)
        getDisplayFiles(res);
    }

    function getDisplayFiles(fileList){
        console.log('get displayed files')
        let displayedFilesList = [];
        fileList.forEach(function(f,index){
        // console.log(selectedFolder)
        if (f.path.indexOf(selectedFolder + fsep)){
            const fileName = f.path.split(selectedFolder+fsep)[1];
            if (fileName && fileName.indexOf(fsep) === -1){
            let file = {
                ...f,
                id:index+1,
                isDir:fileName.indexOf('.') > -1 ? false : true,
                name:fileName
            }
            // console.log(file);
            displayedFilesList.push(file);
            }
        }
        });
        setDisplayedFiles(displayedFilesList)
    }

//   function getChildrenRecursive(parent,foldersArray){
//     parent.children.forEach(function(child,index){
//       foldersArray.forEach(function(folder,index){
//         if (folder.indexOf('/') > -1){
//           const name = folder.split('/')[0];
//           if (name.indexOf('/') === -1 && folder.split('/')[0] === child.name){
//             if (!child.children) child.children = []
//             child.children.push({
//               name:name,
//               path:folder,
//               toggled:false
//             })
//           }
//         }
//       })
//       console.log(child)
//       if (child.children ){
//         console.log('child has children')
//         // getChildrenRecursive(child,foldersArray)
//       }
//     })
//   }

    function getTree(array) {
        var levels = [{}];
        array.forEach(function (a) {
            levels.length = a.level;
            levels[a.level - 1].children = levels[a.level - 1].children || [];
            levels[a.level - 1].children.push(a);
            levels[a.level] = a;
            levels[a.level].toggled = false;
        });
        return levels[0].children;
    }

    function generateTreeViewData(){

        let foldersArray = [];
        
        files.forEach(function(file,index){
            const name = file.path.split(selectedFolder+"/")[1];
            if (name.indexOf('.') === -1 || name.split('.')[name.split('.').length - 1] === "lv2"){
                foldersArray.push({
                    id:index + 1,
                    name:name.indexOf('/') > -1 ? name.split('/')[name.split('/').length - 1] : name,
                    level: 1 + ( file.path.indexOf('/') > -1 ? name.split('/').length - 1 : 0 ),
                    path:file.path
                })
            }
        })

        console.log(foldersArray);

        let newTreeData = {
            name:'zynthian-my-data',
            toggled:true,
            children:getTree(foldersArray)
        };

        // console.log(newTreeData)

        setTreeData(newTreeData)
    }

    function onTreeFolderClick(node){
        console.log(node)
    }
    
    function checkIfDirIsInFolderChain(id){
        let idIsInChain = false;
        folderChain.forEach(function(folder,index){
          if (folder.id === id){
            idIsInChain = true
          }
        });
        return idIsInChain;
    }

    function openFiles(data){

        const dirIsInChain = checkIfDirIsInFolderChain(data.id);
  
        let newSelectedFolder,
            newFoldersChain;
  
        // console.log('dir is in chain', dirIsInChain)
  
        if (!dirIsInChain){
          newSelectedFolder = selectedFolder + fsep + data.name;
          newFoldersChain = [...folderChain,data];
        } else {
          newSelectedFolder = selectedFolder.split(data.name)[0] + data.name;
          const folderIndexInChain = folderChain.findIndex(item => item.id === data.id);
          newFoldersChain = [...folderChain.slice(0,folderIndexInChain + 1)]
        }
  
        // console.log(newFoldersChain,"new folder chain")
  
        setFolderChain(newFoldersChain)
        setSelectedFolder(newSelectedFolder)
      
    }

    function onTreeViewClick(node){

    }

    function refreshFileManager(newFiles){

        console.log(newFiles)

        setFiles(newFiles);
        getDisplayFiles(newFiles);
    }

    let treeViewDisplay;
    if (treeData !== null){
        // console.log(treeData)
        treeViewDisplay = (
            <TreeView 
                data={treeData} 
                onTreeFolderClick={onTreeFolderClick}
                openFiles={openFiles}
            />
        )
    }

    return (
        <div className='file-manager-wrapper'>
            {treeViewDisplay}
            <WebconfFileBrowser 
                displayedFiles={displayedFiles}
                selectedFolder={selectedFolder}
                fsep={fsep}
                folderChain={folderChain}
                setFolderChain={setFolderChain}
                setSelectedFolder={setSelectedFolder}
                openFiles={openFiles}
                refreshFileManager={refreshFileManager}
            />
        </div>
    );
};

export default FileManager;
