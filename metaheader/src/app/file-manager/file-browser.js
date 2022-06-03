import React, { useState, useEffect, useRef, useContext } from 'react'
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
import FileViewer from './file-viewer';
import { IoArrowBack, IoArrowForward, IoRefresh } from 'react-icons/io5';
import { IoIosArrowDropdown } from 'react-icons/io'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { useOnClickOutside } from '../helpers';
import LoadingSpinner from '../loading-spinner';

import { Context } from './context/context-provider'

function WebconfFileBrowser(props){

  const { fileManagerState, fileManagerDispatch } = useContext(Context)
  const { displayedFiles , selectedFolder, folderChain, ffolder } = fileManagerState;

  const { fsep  } = props;
  const [ copiedFiles, setCopiedFiles ] = useState('')
  const [ draggedFiles, setDraggedFiles ] = useState('')
  const [ isDragInsideFileBrowser, setIsDragInsideFileBrowser ] = useState(false);
  const [ loading, setLoading ] = useState(false)
  const [ loadingText, setLoadingText ] = useState('')
  
  const [ showFileViewer, setShowFileViewer ] = useState('');
  const [ viewedFile, setViewedFile ] = useState('')

  const fileBrowserRef = useRef(null);

  function clearSelection(){
    if (!fileBrowserRef.current) return
    fileBrowserRef.current.requestFileAction(ChonkyActions.ClearSelection)
  }

  function openFilesAction(data){
    const file = data.payload.files[0]
    if (file.isDir === true) fileManagerDispatch({type:'SET_SELECTED_FOLDER',payload:file})
    else {
      if (file.path.indexOf('.') > -1){
        const fileType = file.path.split('.')[file.path.split('.').length - 1];
        if (fileType === "json"){
          setViewedFile(file);
          setShowFileViewer(true)
        }
      }
    }
  }

  function createFolderAction(){
    const folderName = window.prompt('Enter new Folder Name:');
    if (folderName !== null){
      const fullPath = (selectedFolder !== null ? selectedFolder + fsep : "") + folderName;
      createFolder(fullPath)
    }
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
    props.getFiles();
  }

  function renameFileAction(data){
    const previousPath = data.state.selectedFiles[0].path;
    const previousName = previousPath.split('/')[previousPath.split('/').length - 1]
    const folderName = window.prompt(`Enter new name for "${previousName}":`,previousName);
    if (folderName !== null){
      const fullPath = selectedFolder === null ? "/home/pi/" + folderName : previousPath.split(selectedFolder)[0] + selectedFolder + "/" + folderName;
      fileManagerDispatch({type:"RENAME_FILE",payload:{previousPath,fullPath}})
      renameFile(previousPath,fullPath)
    }
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
    // fileManagerDispatch({type:"RENAME_FILE",payload:{previousPath,fullPath}})
    props.getFiles(res);
  }

  function deleteFilesAction(data){
      let message = `are you sure you want to delete following files? \n`
      const paths = []
      data.state.selectedFilesForAction.forEach(function(files,index){
        paths.push(files.path);
        message += files.path + "\n"
      })
      
      if ( window.confirm(message)){
        setLoadingText('Deleting Files')
        setLoading(true)
        fileManagerDispatch({type:'DELETE_FILES',payload:paths})
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
        setLoading(false)
        setLoadingText('')
        props.getFiles();
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

    if (paths.length > 0 ){

      setLoadingText('Preparing Download')
      setLoading(true)

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
        let dlFileName = filePath.split(fsep)[filePath.split(fsep).length - 1]
        if (dlFileName.indexOf('.zip') === -1 && res.type === "application/zip") dlFileName += ".zip";
        a.download = dlFileName;
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();
        a.remove();
        setLoading(false)
        setLoadingText('')
      });

    }

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
        destination = (selectedFolder !== null ? selectedFolder + fsep : "") + cf.split(fsep)[cf.split(fsep).length - 1];
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
      let destination = "";
      if (selectedFolder !== null){
        destination = selectedFolder + data.payload.destination.path.split(selectedFolder)[1];
      } else destination =  data.payload.destination.path.split('/home/pi/')[1];

      if (df.indexOf('.') > -1){
        destination += fsep + df.split(fsep)[df.split(fsep).length - 1]
        if (destination.indexOf('undefined') > -1) destination = destination.split('undefined').join('');
      }
    })

    if (draggedFiles.length > 0 && destinationPaths.length > 0) copyPasteFiles(draggedFiles,destinationPaths,true)
  }

  async function copyPasteFiles(previousPaths,destinationPaths,deleteOrigin){

    setLoadingText('Copying Files')
    setLoading(true)

    console.log(previousPaths,destinationPaths)

    copyPasteFile(previousPaths,destinationPaths,deleteOrigin,0)
  }

  async function copyPasteFile(previousPaths,destinationPaths,deleteOrigin,index){
    
    console.log('COPY PASTE FILES')

    // console.log(previousPaths, " PREVIOUS PATHS ")
    // console.log(destinationPaths, " DESTINATION PATHDS")
    // console.log(deleteOrigin, " DELETE ORIGIN")

    const previousPath = previousPaths[index]
    const destinationPath = destinationPaths[index];
    fetch(`http://${window.location.hostname}:3000/copypaste`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({previousPath,destinationPath:"/" + destinationPath,deleteOrigin})
    }).then(async function(res){      
      if (index ===  previousPaths.length - 1){

        if (deleteOrigin === true) fileManagerDispatch({type:'DELETE_FILES',payload:previousPaths})

        const files = await res.json()
        clearSelection();
        setLoading(false);
        setLoadingText('');
        props.refreshFileManager(files);
      } else {
        copyPasteFile(previousPaths,destinationPaths,deleteOrigin,index + 1)
      }
      
    })

  }

  function selectAllFiles(){
    if (!fileBrowserRef.current) return
    const newSelection = new Set()
    for (const file of displayedFiles) {
      newSelection.add(file.id)
    }
    fileBrowserRef.current.setFileSelection(newSelection)
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
    // if (data.id === selectFiles.id) selectAllFiles()
  };

  const createNewFolder = defineFileAction({
    id: "create_files",
    button: {
      name: "Add Folder",
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

  const uploadFiles = defineFileAction({
    id:ChonkyActions.UploadFiles.id,
    button:{
      name:"Upload",
      toolbar: true,
      contextMenu:false,
      icon:ChonkyIconName.upload
    }
  })
  
  const downloadFiles = defineFileAction({
    id:ChonkyActions.DownloadFiles.id,
    button:{
      name:"Download",
      toolbar: true,
      contextMenu:true,
      icon:ChonkyIconName.download
    }
  })

  const selectFiles = defineFileAction({
    id:"select_files",
    button:{
      name:"Select Files",
      toolbar: false,
      contextMenu:true,
      icon:ChonkyIconName.selectAllFiles
    }
  })
  
  const myFileActions = [
    createNewFolder,
    editFiles,
    renameFiles,
    uploadFiles,
    downloadFiles,
    // selectFiles,
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
  
  let fileViewerDisplay;
  if (showFileViewer === true){
    fileViewerDisplay = (
      <FileViewer 
        file={viewedFile}
        setShowFileViewer={setShowFileViewer}
        selectedFolder={selectedFolder}
      />
    )
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

  let loadingDisplay;
  if (loading === true || fileManagerState.filesLoading === true){
    console.log(fileManagerState.filesLoading, " FILES LOADING")
    loadingDisplay = (
      <div className='file-browser-loading-spinner-container'>
        <LoadingSpinner
          text={loadingText}
        />
      </div>
    )
  }

  return (
      <div 
        style={{ height: window.innerHeight - 170, position:"relative" }} 
        onDragOver={onFileUploaderDragOver} 
        onDragLeave={() => onFileUploaderDragLeave()}
        >
          {loadingDisplay}
          {fileUploaderDisplay}
          {fileViewerDisplay}
          <FileBrowser
            files={displayedFiles}
            folderChain={folderChain}
            fileActions={myFileActions}
            onFileAction={handleAction}
            defaultFileViewActionId={ChonkyActions.EnableListView.id}
            clearSelectionOnOutsideClick={true}
            ref={fileBrowserRef}
            disableDefaultFileActions={[
              ChonkyActions.OpenSelection.id,
              // ChonkyActions.SelectAllFiles.id
            ]}
          >
            <FileBrowserHeader 
              getFiles={props.getFiles}
            />
            <FileToolbar />
            <FileList />
            <FileContextMenu  
              
              disableDefaultFileActions={[
                // ChonkyActions.OpenSelection.id,
                ChonkyActions.SelectAllFiles.id
              ]} 
            />
          </FileBrowser>
      </div>
  )
}

const FileBrowserHeader = (props) => {
  const { fileManagerState, fileManagerDispatch } = useContext(Context)
  const {  browseHistory, browseHistoryIndex, } = fileManagerState;
  const { getFiles } = props;
  const [ showHistoryDropDown, setShowHistoryDropDown] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      const lvlUpSvg = document.getElementsByClassName('fa-level-up-alt')[0];
      if (lvlUpSvg && lvlUpSvg !== null) lvlUpSvg.setAttribute('transform','scale(-1 1)')

      var xpath = "//span[text()='Actions']";
      var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      matchingElement.innerText = "More..."
    
      var xpath = "//span[text()='Select all files']";
      var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      matchingElement.innerText = "Select Files"
    }, 10);
  },[])
  
  const ref = useRef();
  useOnClickOutside(ref, () => setShowHistoryDropDown(false));

  function onRefreshClick(){
    fileManagerDispatch({type:'ON_REFRESH_FILES'})
    getFiles()
  }

  function navigateHistory(val){
    let newBrowseHistoryIndex;
    if (val === "back" && fileManagerState.browseHistoryIndex - 1 >= 0) newBrowseHistoryIndex = fileManagerState.browseHistoryIndex - 1;
    else if (val === "forward" &&  fileManagerState.browseHistoryIndex + 1 <= fileManagerState.browseHistory.length - 1) newBrowseHistoryIndex = fileManagerState.browseHistoryIndex + 1;
    else newBrowseHistoryIndex = val;
    if (typeof newBrowseHistoryIndex === "number"){
      fileManagerDispatch({type:"SET_SELECTED_FOLDER", payload:fileManagerState.browseHistory[newBrowseHistoryIndex] ,isViewingHistory:true,browseHistoryIndex:newBrowseHistoryIndex})
    }
  }

  let historyDropDownDisplay;
  if (showHistoryDropDown === true){

    const history = browseHistory.map((h,index) => {
      let nameDisplay = h.path === "/home/pi/" ? "zynthian" : h.path.indexOf('/home/pi/') > -1 ? "zynthian/" + h.path.split('/home/pi/')[1] : h.path;
      let itemCssClass;
      if (index === browseHistoryIndex){
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
        <a className='refresh-button' onClick={onRefreshClick}>
          <IoRefresh/>
          <span>Refresh</span>
        </a>
      </div>
  )
}

export default WebconfFileBrowser;