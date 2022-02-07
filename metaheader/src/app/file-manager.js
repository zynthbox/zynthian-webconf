import React, { useState, useEffect } from 'react'
import WebconfFileBrowser from './file-browser';

const FileManager = () => {

  // console.log(window.location)

  // const rootFolder = "metaheader"
  const rootFolder = "/zynthian-my-data/"
  const fsep = "/";

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

  async function createFolder(fullPath){
    console.log({fullPath})
    const response = await fetch(`http://${window.location.hostname}:3000/createfolder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({fullPath})
    });
    const res = await response.json();
    if (typeof res === Array){
      setFiles(res);
      getDisplayFiles(res);
    }
  }

  async function renameFile(previousPath,fullPath){
    console.log({fullPath})
    const response = await fetch(`http://${window.location.hostname}:3000/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({fullPath,previousPath})
    });
    const res = await response.json();
    if (typeof res === Array){
      setFiles(res);
      getDisplayFiles(res);
    }
  }

  async function deleteFiles(fullPath){
    console.log({fullPath})
    const response = await fetch(`http://${window.location.hostname}:3000/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({fullPath})
    });
    const res = await response.json();
    if (typeof res === Array){
      setFiles(res);
      getDisplayFiles(res);
    }
  }

  return (
    <React.Fragment>
      <WebconfFileBrowser 
         displayedFiles={displayedFiles}
         selectedFolder={selectedFolder}
         fsep={fsep}
         folderChain={folderChain}
         setFolderChain={setFolderChain}
         setSelectedFolder={setSelectedFolder}
         createFolder={createFolder}
         deleteFiles={deleteFiles}
         renameFile={renameFile}
      />
    </React.Fragment>
  );
};

export default FileManager;
