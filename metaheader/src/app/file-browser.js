import React, { useState, useEffect } from 'react'
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import {
  FullFileBrowser,
  FileBrowser,
  FileNavbar,
  FileToolbar,
  FileList,
  FileContextMenu,
  ChonkyIconName,
  ChonkyActions,
  defineFileAction
} from "chonky";

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

  function openFilesAction(obj){

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

  const handleAction = (data) => {
    if (data.id === ChonkyActions.OpenFiles.id) openFilesAction(data)
    if (data.id === createNewFolder.id) alert("Create Folder Action");
    if (data.id === editFiles.id) alert("Edit Folder Action");
    if (data.id === renameFiles.id) alert("Rename Folder Action");
    if (data.id === ChonkyActions.UploadFiles.id) alert("Upload Folder Action");
    if (data.id === ChonkyActions.DownloadFiles.id) alert("Download Folder Action");
    if (data.id === ChonkyActions.DeleteFiles.id) alert("Delete Folder Action");
  };
  const createNewFolder = defineFileAction({
    id: "create_files",
    button: {
      name: "Create Folder",
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.folderCreate
    }
  });
  const editFiles = defineFileAction({
    id: "edit_files",
    button: {
      name: "Edit",
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.archive
    }
  });
  const renameFiles = defineFileAction({
    id: "rename_files",
    button: {
      name: "Rename",
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.code
    }
  });
  
  const myFileActions = [
    createNewFolder,
    editFiles,
    renameFiles,
    ChonkyActions.UploadFiles,
    ChonkyActions.DownloadFiles,
    ChonkyActions.DeleteFiles
  ];

  const tempFiles =  [
    {
      id: "1",
      name: "Normal file.yml",
      isDir: false,
      size: 890,
      modDate: new Date("2012-01-01")
    },
    {
      id: "2",
      name: "Hidden file.mp4",
      isDir: false,
      isHidden: true,
      size: 50000
    },
    {
      id: "3",
      name: "Normal folder",
      isDir: true,
      childrenCount: 12
    },
    {
      id: "7zp",
      name: "Encrypted file.7z",
      isEncrypted: true
    },
    {
      id: "mEt",
      name: "Text File.txt",
      isDir: false
    }
  ]

  const tempFolderChain = [
    { id: "zxc", name: "Folder", isDir: true, childrenCount: 12 },
    { id: "asd", name: "Another Folder", isDir: true }
  ]
  
  return (
      <div style={{ height: window.innerHeight - 190 }}>
        <FileBrowser
          files={displayedFiles}
          folderChain={folderChain}
          fileActions={myFileActions}
          onFileAction={handleAction}
          defaultFileViewActionId={ChonkyActions.EnableListView.id}
          clearSelectionOnOutsideClick={true}
          disableDragAndDropProvider={true}
        >
          <FileNavbar />
          <FileToolbar />
          <FileList />
          <FileContextMenu />
        </FileBrowser>
      </div>
  );
};

export default MyFileBrowser
