import React, { useState, useEffect, useRef } from 'react'
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

function WebconfFileBrowser(props){

    const { displayedFiles, selectedFolder, fsep, folderChain } = props;
    const [ downloadFileLink, setDownloadFileLink] = useState('');
    const [ copiedFiles, setCopiedFiles ] = useState('')

    function checkIfDirIsInFolderChain(id){
        let idIsInChain = false;
        folderChain.forEach(function(folder,index){
          if (folder.id === id){
            idIsInChain = true
          }
        });
        return idIsInChain;
    }

    function openFilesAction(data){

        const dirIsInChain = checkIfDirIsInFolderChain(data.payload.files[0].id);
        const name = data.payload.files[0].name;
  
        let newSelectedFolder,
            newFoldersChain;
  
        // console.log('dir is in chain', dirIsInChain)
  
        if (!dirIsInChain){
          newSelectedFolder = selectedFolder + fsep + data.payload.files[0].name;
          newFoldersChain = [...folderChain, data.payload.files[0]];
        } else {
          newSelectedFolder = selectedFolder.split(name)[0] + name;
          const folderIndexInChain = folderChain.findIndex(item => item.id === data.payload.files[0].id);
          newFoldersChain = [...folderChain.slice(0,folderIndexInChain + 1)]
        }
  
        // console.log(newFoldersChain,"new folder chain")
  
        props.setFolderChain(newFoldersChain)
        props.setSelectedFolder(newSelectedFolder)
      
    }
  
    function createFolderAction(){
      const folderName = window.prompt('Enter new Folder Name:');
      const fullPath = selectedFolder + fsep + folderName;
      props.createFolder(fullPath)
    }
  
    function renameFileAction(data){
      const previousPath = data.state.selectedFiles[0].path;
      console.log(previousPath);
      const folderName = window.prompt('Enter new Folder Name:');
      const fullPath = previousPath.split(selectedFolder)[0] + selectedFolder + fsep + folderName;
      props.renameFile(previousPath,fullPath)
    }

    function deleteFilesAction(data){
        props.deleteFiles(data.state.selectedFilesForAction[0].path)
    }

    function downloadFilesAction(data){
      let path = data.state.selectedFiles[0].path;
      window.open(path)
    }

    function copyFilesAction(data){
      setCopiedFiles(data.state.selectedFiles[0].path)
    }

    function pasteFilesAction(data){
      props.copyFiles(copiedFiles,selectedFolder + copiedFiles.split(fsep)[1])
    }

    const handleAction = (data) => {
      if (data.id === ChonkyActions.OpenFiles.id) openFilesAction(data)
      if (data.id === createNewFolder.id) createFolderAction()
      if (data.id === editFiles.id) alert("Edit Folder Action");
      if (data.id === renameFiles.id) renameFileAction(data)
      if (data.id === ChonkyActions.UploadFiles.id) alert("Upload Folder Action");
      if (data.id === ChonkyActions.DownloadFiles.id) downloadFilesAction(data)
      if (data.id === ChonkyActions.DeleteFiles.id) deleteFilesAction(data);
      if (data.id === ChonkyActions.CopyFiles.id) copyFilesAction(data);
      if (data.id === pasteFiles.id) pasteFiles(data)
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
        contextMenu: true,
        icon: ChonkyIconName.archive
      }
    });
  
    const renameFiles = defineFileAction({
      id: "rename_files",
      button: {
        name: "Rename",
        contextMenu: true,
        icon: ChonkyIconName.code
      }
    });

    const pasteFiles = defineFileAction({
      id: "paste_files",
      button:{
        name:"Paste",
        contextMenu: true,
        icon: ChonkyIconName.paste
      }
    })
    
    const myFileActions = [
      createNewFolder,
      editFiles,
      renameFiles,
      ChonkyActions.UploadFiles,
      ChonkyActions.DownloadFiles,
      ChonkyActions.DeleteFiles,
      ChonkyActions.CopyFiles,
      pasteFiles
    ];

    return (
        <div style={{ height: window.innerHeight - 190 }}>
            <FileBrowser
              files={displayedFiles}
              folderChain={folderChain}
              fileActions={myFileActions}
              onFileAction={handleAction}
              defaultFileViewActionId={ChonkyActions.EnableListView.id}
              clearSelectionOnOutsideClick={true}
            >
              <FileNavbar />
              <FileToolbar />
              <FileList />
              <FileContextMenu />
            </FileBrowser>
        </div>
    )
}

export default WebconfFileBrowser;

