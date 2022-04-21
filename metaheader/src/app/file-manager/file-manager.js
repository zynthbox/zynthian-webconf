import React, { useState, useEffect, Suspense, lazy } from 'react'
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import LoadingSpinner from '../loading-spinner'

setChonkyDefaults({ iconComponent: ChonkyIconFA });

const WebconfFileBrowser = lazy(()=>import('./file-browser'))
const TreeView = lazy(()=>import('./tree-view'))

import { usePrevious } from '../helpers'

const FileManager = () => {

    const rootFolder = "/zynthian-my-data"
    const rootFolderChainObject = { id: 'xcv', name: rootFolder, isDir: true }
    const fsep = "/";

    const [ files, setFiles ] = useState([])
    const [ displayedFiles, setDisplayedFiles ] = useState([])
    const [ folderChain, setFolderChain ] = useState([rootFolderChainObject])
    const [ selectedFolder, setSelectedFolder ] = useState(rootFolder)
    const previousSelectedFolder = usePrevious(selectedFolder)
    const [ browserHistory, setBrowserHistory ] = useState([])
    // console.log(browserHistory);
    const [ browserHistoryIndex, setBrowserHistoryIndex ] = useState(-1);
    const [ isViewingHistory, setIsViewingHistory ] = useState(false)
    // console.log(browserHistoryIndex,"browser history index")
    const [ treeData, setTreeData ] = useState(null);
  
    const [ showFileUploader, setShowFileUploader ] = useState(false)


    useEffect(() => {
        getFiles()
    }, []);

    useEffect(() => {
      getDisplayFiles(files)
      if (selectedFolder !== null && selectedFolder !== previousSelectedFolder && isViewingHistory === false){
            let newBrowserHistory = []
            const obj =  {path:selectedFolder,folderChain:folderChain}
            if (browserHistoryIndex !== browserHistory.length - 1){
                newBrowserHistory = [...browserHistory.slice(0,browserHistoryIndex),obj]
            } else [
                newBrowserHistory =  [ ...browserHistory,obj]
            ]

            setBrowserHistory(newBrowserHistory)
       }
       setIsViewingHistory(false)
    },[selectedFolder])

    useEffect(() => {
        const newBrowserHistoryIndex = browserHistory.length - 1;
        setBrowserHistoryIndex(newBrowserHistoryIndex)
    },[browserHistory])

    useEffect(() => {
        if (browserHistoryIndex !== browserHistory.length && browserHistory.length > 0 ){
            // setIsViewingHistory(true)
            setSelectedFolder(browserHistory[browserHistoryIndex].path)
            setFolderChain(browserHistory[browserHistoryIndex].folderChain)
        } else {
            setIsViewingHistory(false)
        }
    },[browserHistoryIndex])

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
            const name = file.path.split(rootFolder+"/")[1];
            if (name){
                if (name.indexOf('.') === -1 || name.split('.')[name.split('.').length - 1] === "lv2"){
                    foldersArray.push({
                        id:index + 1,
                        name:name.indexOf('/') > -1 ? name.split('/')[name.split('/').length - 1] : name,
                        level: 1 + ( file.path.indexOf('/') > -1 ? name.split('/').length - 1 : 0 ),
                        path:file.path
                    })
                }
            }
        })

        let newTreeData = {
            name:'zynthian-my-data',
            toggled:true,
            path:'/home/pi/zynthian-my-data',
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

    function onTreeItemClick(data,parentIds,a){
        let newTreeData = Object.assign({},treeData);
        treeDataRecursiveRender(newTreeData,data)
        setTreeData(newTreeData)
        if (parentIds){
            generateFolderChain(data,parentIds)
        }
    }

    function generateFolderChain(data,parentIds){
      const path = rootFolder + data.path.split(rootFolder)[1]
      const pathArray = path.split(rootFolder)[1].split(fsep);
    //   console.log(pathArray,parentIds)
      let newFoldersChain = [rootFolderChainObject]
      parentIds.forEach(function(pid,index){        
        newFoldersChain.push({
          id:pid,
          path:path,
          name:pathArray[index + 1],
          isDir:true
        })
      });
      setFolderChain(newFoldersChain)
      setSelectedFolder(path)
    }

    function refreshFileManager(newFiles){
        setFiles(newFiles);
        getDisplayFiles(newFiles);
    }

    function navigateHistory(val){
        setIsViewingHistory(true)
        let newBrowserHistoryIndex;

        if (val === "back" && (browserHistoryIndex - 1) > -1){
            newBrowserHistoryIndex = browserHistoryIndex - 1;
        } else if (val === "forward" && browserHistoryIndex <= browserHistory.length - 1 ){
            newBrowserHistoryIndex = browserHistoryIndex + 1;
        } else if (val !== "forward" && val !== "back") {
            newBrowserHistoryIndex = val;
        }
        
        if (typeof newBrowserHistoryIndex === "number") setBrowserHistoryIndex(newBrowserHistoryIndex)
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

    let fileBrowserDisplay = <LoadingSpinner/>
    if (files !== null && displayedFiles !== null){
        fileBrowserDisplay = (
            <Suspense fallback={<LoadingSpinner/>}>
                <WebconfFileBrowser 
                    displayedFiles={displayedFiles}
                    selectedFolder={selectedFolder}
                    browserHistory={browserHistory}
                    browserHistoryIndex={browserHistoryIndex}
                    navigateHistory={navigateHistory}
                    fsep={fsep}
                    folderChain={folderChain}
                    setFolderChain={setFolderChain}
                    setSelectedFolder={setSelectedFolder}
                    openFiles={openFiles}
                    refreshFileManager={refreshFileManager}
                    showFileUploader={showFileUploader}
                    setShowFileUploader={setShowFileUploader}
                />
            </Suspense>
        )
    }

    return (
        <div style={{height: window.innerHeight - 170}} className='file-manager-wrapper'>
            {treeViewDisplay}
            {fileBrowserDisplay}
        </div>
    );
};

export default FileManager;
