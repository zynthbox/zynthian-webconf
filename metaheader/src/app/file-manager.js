import React, { useState, useEffect } from 'react'
import WebconfFileBrowser from './file-browser';
import TreeView from './tree-view';

const FileManager = () => {

    // console.log(window.location)
    // const rootFolder = "metaheader"

    const rootFolder = "/zynthian-my-data"
    const rootFolderChainObject = { id: 'xcv', name: rootFolder, isDir: true }
    const fsep = "/";

    const [ files, setFiles ] = useState([])
    // console.log(files,"files")
    const [ displayedFiles, setDisplayedFiles ] = useState([])
    // console.log(displayedFiles,"displayed files")
    const [ folderChain, setFolderChain ] = useState([rootFolderChainObject])
    console.log(folderChain)
    const [ selectedFolder, setSelectedFolder ] = useState(rootFolder)
    // console.log(selectedFolder)
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
        let displayedFilesList = [];
        fileList.forEach(function(f,index){
            if (f.path.indexOf(selectedFolder + fsep) > -1){
                    const fileName = f.path.split(selectedFolder+fsep)[1];
                    if (fileName && fileName.indexOf(fsep) === -1){
                        let file = {
                        ...f,
                        id:index+1,
                        isDir:fileName.indexOf('.') > -1 ? false : true,
                        name:fileName
                    }
                    displayedFilesList.push(file);
                }
            }
        });
        setDisplayedFiles(displayedFilesList)
    }

    function getTree(array,id) {
        var levels = [{}];
        array.forEach(function (a) {
            levels.length = a.level;
            levels[a.level - 1].children = levels[a.level - 1].children || [];
            levels[a.level - 1].children.push(a);
            levels[a.level] = a;
            if (levels[a.level] === id) {
                levels[a.level].toggled = true;
                levels[a.level].active = false;
            }
            // levels[a.level].toggled = false;
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

        let newTreeData = {
            name:'zynthian-my-data',
            toggled:true,
            children:getTree(foldersArray)
        };

        setTreeData(newTreeData)
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

        const treeDataObject = Object.assign({toggled:true,active:true},data)

        onTreeItemClick(treeDataObject)
        
    }

    function treeDataRecursiveRender(item,data){
        item.children.forEach(function(child,index){
            if (child.id === data.id) {
                child.active = data.active;
                child.toggled = data.toggled;
            }
            else child.active = false;
            if (child.children && child.children.length > 0){
                treeDataRecursiveRender(child,data)
            }
        })
    }

    function onTreeItemClick(data,parentIds){
        let newTreeData = Object.assign({},treeData);
        treeDataRecursiveRender(newTreeData,data)
        setTreeData(newTreeData)
        // const newSelectedFolder = rootFolder + ;
        generateFolderChain(data,parentIds)
    }

    function generateFolderChain(data,parentIds){
      const path = rootFolder + data.path.split(rootFolder)[1]
      const pathArray = path.split(rootFolder)[1].split(fsep);
      console.log(pathArray,parentIds)
      let newFoldersChain = [rootFolderChainObject]
      parentIds.forEach(function(pid,index){        
        newFoldersChain.push({
          id:pid,
          path:path,
          name:pathArray[index] + 1,
          isDir:true
        })
      });
      setFolderChain(newFoldersChain)
      setSelectedFolder(path)
    }

    function refreshFileManager(newFiles){
        console.log("refresh file manager")
        setFiles(newFiles);
        getDisplayFiles(newFiles);
    }

    let treeViewDisplay;
    if (treeData !== null){
        treeViewDisplay = (
            <TreeView 
                data={treeData} 
                onTreeItemClick={onTreeItemClick}
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
            <div id="file-manager-overlay"></div>
        </div>
    );
};

export default FileManager;
