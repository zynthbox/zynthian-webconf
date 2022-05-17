import React, { useState, useEffect, useRef } from 'react'
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
import FileUploader from './file-uploader';
import { IoArrowBack, IoArrowForward, IoRefresh } from 'react-icons/io5';
import { IoIosArrowDropdown } from 'react-icons/io'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { useOnClickOutside } from '../helpers';

function WebconfFileBrowser(props){

  const { displayedFiles, selectedFolder, fsep, folderChain } = props;
  const [ copiedFiles, setCopiedFiles ] = useState('')
  const [ draggedFiles, setDraggedFiles ] = useState('')
  const [ isDragInsideFileBrowser, setIsDragInsideFileBrowser ] = useState(false);
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
    const response = await fetch(`http://${window.location.hostname}:3000/createfolder`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body:JSON.stringify({fullPath})
    });
    const res = await response.json();
    props.refreshFileManager(res);
  }

  function renameFileAction(data){
    const previousPath = data.state.selectedFiles[0].path;
    const previousName = previousPath.split('/')[previousPath.split('/').length - 1]
    const folderName = window.prompt(`Enter new name for "${previousName}":`);
    const fullPath = previousPath.split(selectedFolder)[0] + selectedFolder + fsep + folderName;
    renameFile(previousPath,fullPath)
  }

  async function renameFile(previousPath,fullPath){
    const response = await fetch(`http://${window.location.hostname}:3000/rename`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body:JSON.stringify({fullPath,previousPath})
    });
    const res = await response.json();
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
        deleteFile(paths,0)
      }
  }

  async function deleteFile(paths,index){
    const fullPath = paths[index];
    fetch(`http://${window.location.hostname}:3000/delete`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body:JSON.stringify({fullPath})
    }).then(async function(response){
      if (index === paths.length - 1){
        const res = await response.json();
        clearSelection();
        props.refreshFileManager(res);
      } else {
        deleteFile(paths,index + 1)
      }
    });
  }

  async function downloadFilesAction(data){

    let paths = [];

    data.state.selectedFiles.forEach(function(sf,index){
      paths.push(sf.path)
    });

    paths.forEach(async function(filePath,index){

      const response = await fetch(`http://${window.location.hostname}:3000/download`, {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body:JSON.stringify({filePath})
      });
      const res = await response.blob();

      var url = window.URL.createObjectURL(res);
      var a = document.createElement('a');
      a.href = url;
      a.download = filePath.split(fsep)[filePath.split(fsep).length - 1];
      document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
      a.click();
      a.remove();

    });

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

    setIsDragInsideFileBrowser(true);

    let paths = [];
    data.state.selectedFiles.forEach(function(sf,index){
      paths.push(sf.path)
    })

    setDraggedFiles(paths)
  }

  function endDragNDropAction(data){

    setIsDragInsideFileBrowser(false);

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
    if (data.id === ChonkyActions.UploadFiles.id) props.setShowFileUploader(true)
    if (data.id === ChonkyActions.DownloadFiles.id) downloadFilesAction(data)
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
    ChonkyActions.UploadFiles,
    ChonkyActions.DownloadFiles,
    ChonkyActions.DeleteFiles,
    ChonkyActions.CopyFiles,
    ChonkyActions.StartDragNDrop,
    ChonkyActions.EndDragNDrop,
    pasteFiles 
  ];


  let hideMaskTimeout;

  function onFileUploaderDragOver(){
    if (isDragInsideFileBrowser === false){
      clearTimeout(hideMaskTimeout)
      props.setShowFileUploader(true)
    }
  }

  function onFileUploaderDragLeave(){
    hideMaskTimeout = setTimeout(() => {
      props.setShowFileUploader(false)
    }, 10);
  }
  
  let fileUploaderDisplay;
  if (props.showFileUploader === true){
      fileUploaderDisplay = (
          <React.Fragment>
              <FileUploader 
                  selectedFolder={selectedFolder} 
                  fsep={fsep} 
                  refreshFileManager={props.refreshFileManager} 
                  setShowFileUploader={props.setShowFileUploader}
              />
          </React.Fragment>
      )
  }

  return (
      <div 
        style={{ height: window.innerHeight - 170, position:"relative" }} 
        onDragOver={onFileUploaderDragOver} 
        onDragLeave={() => onFileUploaderDragLeave()}
        >
          {fileUploaderDisplay}
          <FileBrowser
            files={displayedFiles}
            folderChain={folderChain}
            fileActions={myFileActions}
            onFileAction={handleAction}
            defaultFileViewActionId={ChonkyActions.EnableListView.id}
            clearSelectionOnOutsideClick={true}
            ref={fileBrowserRef}
          >
            <FileBrowserHeader 
              navigateHistory={props.navigateHistory}
              browserHistory={props.browserHistory}
              browserHistoryIndex={props.browserHistoryIndex}
              getFiles={props.getFiles}
            />
            <FileToolbar />
            <FileList />
            <FileContextMenu />
          </FileBrowser>
      </div>
  )
}

const FileBrowserHeader = (props) => {
  
  const { navigateHistory, browserHistory, browserHistoryIndex, getFiles } = props;
  const [ showHistoryDropDown, setShowHistoryDropDown] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      const lvlUpSvg = document.getElementsByClassName('fa-level-up-alt')[0];
      // console.log(lvlUpSvg)
      if (lvlUpSvg && lvlUpSvg !== null) lvlUpSvg.setAttribute('transform','scale(-1 1)')
    }, 10);
  },[])
  

  const ref = useRef();
  useOnClickOutside(ref, () => setShowHistoryDropDown(false));

  let historyDropDownDisplay;
  if (showHistoryDropDown === true){
    const history = browserHistory.map((h,index) => {

      let nameDisplay = h.path.split('/')[h.path.split('/').length - 1]
      let itemCssClass;
      if (index === browserHistoryIndex){
        itemCssClass = "active"
      }
      return (
        <li><a className={itemCssClass} title={h.path} onClick={() => navigateHistory(index)}>{nameDisplay}</a></li>
      )
    })
    historyDropDownDisplay = (
      <div ref={ref} className='browser-history-submenu' >
        <a onClick={() => setShowHistoryDropDown(false)} className='close-browser-history'>
          <AiOutlineCloseCircle/>
        </a>
        <ul>
          {history}
        </ul>
      </div>
    )
  }

  return (
      <div  className='file-navbar-container-custom'>   
        <ul className='browser-navigation-menu'>
          <li><a onClick={() => setShowHistoryDropDown(true)}><IoIosArrowDropdown/></a></li>
          <li><a onClick={() => navigateHistory('back')}><IoArrowBack/></a></li>
          <li><a onClick={() => navigateHistory('forward')}><IoArrowForward/></a></li>
        </ul>
        {historyDropDownDisplay}
        <FileNavbar />
        <a className='refresh-button' onClick={() => getFiles()}><IoRefresh/></a>
      </div>
  )
}

export default WebconfFileBrowser;