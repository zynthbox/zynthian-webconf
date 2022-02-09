import React, { useState, useRef } from 'react'
import {
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
  const [ copiedFiles, setCopiedFiles ] = useState('')
  const [ draggedFiles, setDraggedFiles ] = useState('')
  const fileBrowserRef = useRef(null);

  function clearSelection(){
    if (!fileBrowserRef.current) return
    fileBrowserRef.current.requestFileAction(ChonkyActions.ClearSelection)
  }

  function openFilesAction(data){
    props.openFiles(data.payload.files[0])
  }

  function createFolderAction(){
    const folderName = window.prompt('Enter new Folder Name:');
    const fullPath = selectedFolder + fsep + folderName;
    createFolder(fullPath)
  }

  async function createFolder(fullPath){
    // console.log({fullPath})
    const response = await fetch(`http://${window.location.hostname}:3000/createfolder`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body:JSON.stringify({fullPath})
    });
    const res = await response.json();
    console.log(res,"res after create folder");
    props.refreshFileManager(res);
  }

  function renameFileAction(data){
    const previousPath = data.state.selectedFiles[0].path;
    // console.log(previousPath);
    const folderName = window.prompt('Enter new Folder Name:');
    const fullPath = previousPath.split(selectedFolder)[0] + selectedFolder + fsep + folderName;
    renameFile(previousPath,fullPath)
  }

  async function renameFile(previousPath,fullPath){
    // console.log({fullPath})
    const response = await fetch(`http://${window.location.hostname}:3000/rename`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body:JSON.stringify({fullPath,previousPath})
    });
    const res = await response.json();
    console.log(res,"res after rename");
    props.refreshFileManager(res);
  }

  function deleteFilesAction(data){
      let message = `are you sure you want to delete following files? \n`
      const paths = []
      data.state.selectedFilesForAction.forEach(function(files,index){
        paths.push(files.path);
        message += files.path + "\n"
      })
      
      if ( window.confirm(message)){
        deleteFiles(paths)
      }
  }

  async function deleteFiles(paths){
    paths.forEach(async function(fullPath,index){
      // console.log(fullPath)
      const response = await fetch(`http://${window.location.hostname}:3000/delete`, {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body:JSON.stringify({fullPath})
      });
      const res = await response.json();
      console.log(res,"res after delete");
      if (index === paths.length - 1){
        clearSelection();
        props.refreshFileManager(res);
      }
    })
  }

  function downloadFilesAction(data){
    let path = data.state.selectedFiles[0].path;
    window.open(path)
  }

  function copyFilesAction(data){
    let paths = [];
    data.state.selectedFiles.forEach(function(sf,index){
      paths.push(sf.path)
    })
    setCopiedFiles(paths)
  }

  function pasteFilesAction(data){
    // let destination = selectedFolder + fsep;
    // if (copiedFiles.indexOf('.') > -1){
    //   destination = selectedFolder + fsep + copiedFiles.split(fsep)[copiedFiles.split(fsep).length - 1];
    // }
    let destinationPaths = [];
    copiedFiles.forEach(function(cf,index){
      let destination = selectedFolder + fsep;
      if (cf.indexOf('.') > -1){
        destination = selectedFolder + fsep + cf.split(fsep)[cf.split(fsep).length - 1];
      }
      destinationPaths.push(destination)
    })

    copyPasteFiles(copiedFiles,destinationPaths)
  }

  function startDragNDropAction(data){

    let paths = [];
    data.state.selectedFiles.forEach(function(sf,index){
      paths.push(sf.path)
    })

    setDraggedFiles(paths)
  }

  function endDragNDropAction(data){
    let destinationPaths = [];
    draggedFiles.forEach(function(df,index){
      let destination = selectedFolder + data.payload.destination.path.split(selectedFolder)[1];
      if (df.indexOf('.') > -1){
        destination += fsep + df.split(fsep)[df.split(fsep).length - 1]
      }
      destinationPaths.push(destination)
    })
    copyPasteFiles(draggedFiles,destinationPaths,true)
  }

  async function copyPasteFiles(previousPaths,destinationPaths,deleteOrigin){
    // console.log({previousPaths,destinationPaths})
    previousPaths.forEach(async function(previousPath,index){
      const destinationPath = destinationPaths[index];
      const response = await fetch(`http://${window.location.hostname}:3000/copypaste`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({previousPath,destinationPath,deleteOrigin})
      });
      const res = await response.json();
      if (index === previousPaths.length - 1){
        clearSelection();
        props.refreshFileManager(res);
      }
    })
  }

  const handleAction = (data) => {
    if (data.id === ChonkyActions.OpenFiles.id) openFilesAction(data)
    if (data.id === createNewFolder.id) createFolderAction()
    if (data.id === editFiles.id) alert("Edit Folder Action");
    if (data.id === renameFiles.id) renameFileAction(data)
    // if (data.id === ChonkyActions.UploadFiles.id) alert("Upload Folder Action");
    // if (data.id === ChonkyActions.DownloadFiles.id) downloadFilesAction(data)
    if (data.id === ChonkyActions.DeleteFiles.id) deleteFilesAction(data);
    if (data.id === ChonkyActions.CopyFiles.id) copyFilesAction(data);
    if (data.id === pasteFiles.id) pasteFilesAction(data)
    if (data.id === ChonkyActions.StartDragNDrop.id) startDragNDropAction(data)
    if (data.id === ChonkyActions.EndDragNDrop.id) endDragNDropAction(data)
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
    // ChonkyActions.UploadFiles,
    // ChonkyActions.DownloadFiles,
    ChonkyActions.DeleteFiles,
    ChonkyActions.CopyFiles,
    ChonkyActions.StartDragNDrop,
    ChonkyActions.EndDragNDrop,
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
            ref={fileBrowserRef}
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