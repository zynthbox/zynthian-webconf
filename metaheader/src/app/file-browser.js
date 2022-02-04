import React, { useState, useEffect } from 'react'
import { FullFileBrowser, ChonkyActions } from 'chonky';
const MyFileBrowser = () => {

  // console.log(window.location)

  const rootFolder = "zynthian-my-data"

  const [ files, setFiles ] = useState([])
  // console.log(files,"files")
  const [ displayedFiles, setDisplayedFiles ] = useState([])
  // console.log(displayedFiles,"displayed files")
  const [ folderChain, setFolderChain ] = useState([{ id: 'xcv', name: rootFolder, isDir: true }])
  const [ selectedFolder, setSelectedFolder ] = useState("")

  useEffect(() => {
    getFiles()
  }, []);

  useEffect(() => {
    getDisplayFiles(files)
  },[selectedFolder])

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
      // console.log(selectedFolder)
      if (f.path.indexOf(selectedFolder + "/")){
        const fileName = f.path.split(selectedFolder+"/")[1];
        if (fileName && fileName.indexOf('/') === -1){
          let file = {
            ...f,
            id:index,
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

  function checkIfDirIsInFolderChain(id){
    let idIsInChain = false;
    folderChain.forEach(function(folder,index){
      if (folder.id === id){
        idIsInChain = true
      }
    });
    return idIsInChain;
  }

  function onFileAction(obj){
    if (obj.id === 'open_files'){

      const dirIsInChain = checkIfDirIsInFolderChain(obj.payload.files[0].id);
      const name = obj.payload.files[0].name;

      let newSelectedFolder,
          newFoldersChain;

      // console.log('dir is in chain', dirIsInChain)

      if (!dirIsInChain){
        newSelectedFolder = selectedFolder + "/" + obj.payload.files[0].name;
        newFoldersChain = [...folderChain, obj.payload.files[0]];
      } else {
        newSelectedFolder = selectedFolder.split(name)[0] + name;
        const folderIndexInChain = folderChain.findIndex(item => item.id === obj.payload.files[0].id);
        newFoldersChain = [...folderChain.slice(0,folderIndexInChain + 1)]
      }

      // console.log(newFoldersChain,"new folder chain")

      setFolderChain(newFoldersChain)
      setSelectedFolder(newSelectedFolder)
    }
  }

  return (
      <div style={{ height: window.innerHeight - 190 }}>
          <FullFileBrowser
            onFileAction={onFileAction}
            files={displayedFiles} 
            folderChain={folderChain} 
            defaultFileViewActionId={ChonkyActions.EnableListView.id}
            />
      </div>
  );
};

export default MyFileBrowser
