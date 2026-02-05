import React, { useState, useEffect, useRef, useContext } from 'react'
import {
  FileBrowser,
  FullFileBrowser,
  FileNavbar,
  FileToolbar,
  FileList,
  FileContextMenu,
  ChonkyIconName,
  ChonkyActions,
  defineFileAction,
  setChonkyDefaults
} from "chonky";
import { usePrevious } from '../helpers'
import FileUploader from './file-uploader';
import FileViewer from './file-viewer';
import { IoArrowBack, IoArrowForward, IoRefresh } from 'react-icons/io5';
import { IoIosArrowDropdown } from 'react-icons/io'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { useOnClickOutside } from '../helpers';
import LoadingSpinner from '../loading-spinner';
import { useLongPress } from '../helpers';

import { Context } from './context/context-provider'
import { useDrag, useDrop } from 'react-dnd';
import PaginationWithEllipsis from '../components/PaginationWithEllipsis';
import { isDraggingOverlayRef } from '../components/globalState';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import { FaCut } from 'react-icons/fa'; // Importiere das gewünschte React Icon

const MyCustomIcon = (props) => {
  const { icon } = props;
  if (icon === 'cut') return <FaCut style={{ fontSize: '1.1em' }} />;
  return <ChonkyIconFA {...props} />;
};

setChonkyDefaults({ iconComponent: MyCustomIcon }); 

const DraggableOverlay = ({ file, rect }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FILE',
    item: { file },
    // collect: (monitor) => ({
    //   isDragging: monitor.isDragging(),
    // }),
    collect: (monitor) => {
      const isDraggingNow = monitor.isDragging();
      isDraggingOverlayRef.current = isDraggingNow; // 🔥
      return { isDragging: isDraggingNow };
    },
  }));

  // Only show the overlay and block pointer events when actually dragging
  const overlayStyle = {
    position: 'absolute',
    top: rect?.top ?? 0,
    left: rect?.left ?? 0,
    width: rect?.width ?? 0,
    height: rect?.height ?? 0,
    opacity: isDragging ? 0.3 : 0, // Show overlay only during dragging
    zIndex: 10,  // Overlay on top when dragging
    cursor: 'grab',
    pointerEvents: isDragging ? 'none' : 'auto',  // Block pointer events only during dragging
  };

  return <div ref={drag} style={overlayStyle} />;
};


const DropZone = ({ onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FILE',
    drop: (item) => onDrop(item.file),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        border: '2px dashed gray',
        padding: '20px',
        marginTop: '20px',
        background: isOver ? '#d0ffe0' : '#f0f0f0',
        textAlign: 'center',
      }}
    >
      {isOver ? 'Release to drop here' : 'Drag file here'}
    </div>
  );
};

function WebconfFileBrowser(props){

  const { fileManagerState, fileManagerDispatch } = useContext(Context)
  const { displayedFiles , selectedFolder, folderChain, ffolder } = fileManagerState;

  const { fsep  } = props;
  const [ isCuttingFiles, setIsCuttingFiles ] = useState(false)
  const [ copiedFiles, setCopiedFiles ] = useState('')  
  const [ draggedFiles, setDraggedFiles ] = useState('')
  const [ isDragInsideFileBrowser, setIsDragInsideFileBrowser ] = useState(false);
  const [ loading, setLoading ] = useState(false)
  const [ loadingText, setLoadingText ] = useState('')
  
  const [ showFileViewer, setShowFileViewer ] = useState('');
  const [ viewedFile, setViewedFile ] = useState('')

  const fileBrowserRef = useRef(null);

  const ROOTDIR = props.rootDirectory;

  const fileListContainerRef = useRef();
  const [itemRects, setItemRects] = useState([]);
  // const [droppedFiles, setDroppedFiles] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);  
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  useEffect(() => {    
    setCurrentPage(1);
  }, [selectedFolder]);
  // const itemsPerPage = 50;

  // drag and drop overlay
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     const container = fileListContainerRef.current;
  //     if (!container) return;
  
  //     const containerRect = container.getBoundingClientRect();
  //     const nodes = container.querySelectorAll('[data-chonky-file-id]'); // Query for the file rows
  
  //     if (!nodes || nodes.length === 0) return;
  
  //     const newRects = Array.from(nodes).map((node) => {
  //       const iconNode = node.querySelector('[data-icon]'); // Target the icon element within the file row
  //       if (!iconNode) return null;
  
  //       const fileRect = iconNode.getBoundingClientRect(); // Get bounding box of the icon
  //       const id = node.getAttribute('data-chonky-file-id');
  //       return {
  //         id,
  //         rect: {
  //           top: fileRect.top - containerRect.top,
  //           left: fileRect.left - containerRect.left,
  //           width: fileRect.width,
  //           height: fileRect.height, // Use the icon's height
  //         },
  //       };
  //     }).filter(Boolean); // Remove null entries if any file rows have no icon
        
  //     setItemRects(newRects);
  //   }, 100); // Give time for DOM to render
  
  //   return () => clearTimeout(timeout);
  // }, [displayedFiles,currentPage]); 

  const handleDrop = (file) => {
    setDroppedFiles((prev) => [...prev, file]);
  };


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

  function createFolderAction(ROOTDIR){
    const folderName = window.prompt('Enter new Folder Name:');
    if (folderName !== null){
      const fullPath = (ROOTDIR.startsWith('/home/pi')?ROOTDIR.substring(9):ROOTDIR)
                      +(selectedFolder !== null ? selectedFolder + fsep : "") + folderName;
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

  function renameFileAction(data,ROOTDIR){
    const previousPath = data.state.selectedFiles[0].path;
    const previousName = previousPath.split('/')[previousPath.split('/').length - 1]
    const folderName = window.prompt(`Enter new name for "${previousName}":`,previousName);
    if (folderName !== null){
      const fullPath = selectedFolder === null ? ROOTDIR + folderName : previousPath.split(selectedFolder)[0] + selectedFolder + "/" + folderName;
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

  function copyFilesAction(data,ROOTDIR){
    let paths = [];
    data.state.selectedFiles.forEach(function(sf,index){
      paths.push(sf.path)
    })
    setCopiedFiles(paths)
    setIsCuttingFiles(false);
  }

  function cutFilesAction(data,ROOTDIR){        
    let paths = [];
    data.state.selectedFiles.forEach(function(sf,index){
      paths.push(sf.path)
    })
    setCopiedFiles(paths)
    setIsCuttingFiles(true);
  }


  function pasteFilesAction(data,ROOTDIR){
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
      destination = ROOTDIR.split('/zynthian/')[1] + destination;
    
      destinationPaths.push(destination)
    })

    copyPasteFiles(copiedFiles,destinationPaths,isCuttingFiles)
  }

  

  function startDragNDropAction(data){

    setIsDragInsideFileBrowser(true);

    let paths = [];
    data.state.selectedFiles.forEach(function(sf,index){
      paths.push(sf.path)
    })

    setDraggedFiles(paths)
  }

  function endDragNDropAction(data,ROOTDIR){

    setIsDragInsideFileBrowser(false);

    let destinationPaths = [];
    draggedFiles.forEach(function(df,index){
      let destination = "";
      if (selectedFolder !== null){
        destination = selectedFolder + data.payload.destination.path.split(selectedFolder)[1];
      } else destination =  data.payload.destination.path.split(ROOTDIR)[1];

      if (df.indexOf('.') > -1){
        destination += fsep + df.split(fsep)[df.split(fsep).length - 1]
        if (destination.indexOf('undefined') > -1) destination = destination.split('undefined').join('');
      }

      // destination = ROOTDIR.split('/home/pi/')[1] + destination;
      destination = ROOTDIR.split('/zynthian/')[1] + destination;
      destinationPaths.push(destination)

    })

    if (draggedFiles.length > 0 && destinationPaths.length > 0 && draggedFiles[0] !== destinationPaths[0]) copyPasteFiles(draggedFiles,destinationPaths,true)
  }

  async function copyPasteFiles(previousPaths,destinationPaths,deleteOrigin){

    setLoadingText('Copying Files')
    setLoading(true)
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
    if (data.id === createNewFolder.id) createFolderAction(ROOTDIR)
    if (data.id === editFiles.id) alert("Edit Folder Action");
    if (data.id === renameFiles.id) renameFileAction(data,ROOTDIR)
    if (data.id === ChonkyActions.UploadFiles.id) props.setShowFileUploader(true)
    if (data.id === ChonkyActions.DownloadFiles.id) downloadFilesAction(data)
    if (data.id === ChonkyActions.DeleteFiles.id) deleteFilesAction(data);
    if (data.id === ChonkyActions.CopyFiles.id) copyFilesAction(data,ROOTDIR);
    if (data.id === pasteFiles.id) pasteFilesAction(data,ROOTDIR)
    if (data.id === cutFiles.id) cutFilesAction(data,ROOTDIR)
    if (data.id === ChonkyActions.StartDragNDrop.id) startDragNDropAction(data)
    if (data.id === ChonkyActions.EndDragNDrop.id) endDragNDropAction(data,ROOTDIR)
   
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
      toolbar:true,
      group: "Actions",
      icon: ChonkyIconName.archive
    }
  });

  const renameFiles = defineFileAction({
    id: "rename_files",
    button: {
      name: "Rename",
      contextMenu: true,
      toolbar:true,
      group: "Actions",
      icon: ChonkyIconName.code
    }
  });

  const cutFiles = defineFileAction({
    id: "cut_files",
    button: {
      name: "Cut",
      contextMenu: true,    
      toolbar:true,
      group: "Actions",
      icon: "cut"  
    }
  });

  const pasteFiles = defineFileAction({
    id: "paste_files",
    button:{
      name:"Paste",
      contextMenu: true,
      toolbar:true,
      group: "Actions",
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
      contextMenu:false,
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
    uploadFiles,
    downloadFiles,
    editFiles,
    renameFiles,   
    cutFiles,    
    ChonkyActions.CopyFiles,
    // selectFiles,
    ChonkyActions.DeleteFiles,   
    ChonkyActions.StartDragNDrop,
    ChonkyActions.EndDragNDrop,
    pasteFiles,    
  ];


  let hideMaskTimeout;

  function onFileUploaderDragOver(event){
    if (isDraggingOverlayRef.current) {             
      return;
    }
    event.preventDefault(); // Needed to allow drop
  
    if (isDragInsideFileBrowser === false){
      clearTimeout(hideMaskTimeout)
      props.setShowFileUploader(true)
    }
  }

  function onFileUploaderDragLeave(){
    if (isDraggingOverlayRef.current) {         
      return;
    }
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
        rootDirectory ={props.rootDirectory}
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
                  rootDirectory ={props.rootDirectory}
                  sf3convertQuality={props.sf3convertQuality}
              />
          </React.Fragment>
      )
  }

  let loadingDisplay;
  if (loading === true || fileManagerState.filesLoading === true){    
    loadingDisplay = (
      <div className='file-browser-loading-spinner-container'>
        <LoadingSpinner
          text={loadingText}
        />
      </div>
    )
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // reset to first page
  };
   // Calculate total pages
   const totalPages = Math.ceil(displayedFiles.length / itemsPerPage);

   // Get paginated data
   const paginatedData = displayedFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

    // Handle pagination
  const goToPage = (page) => setCurrentPage(page);
    

  return (
      <div 
        ref={fileListContainerRef} 
        style={{ height: window.innerHeight - 170, position:"relative",background:"#efefef"}} 
        onDragOver={onFileUploaderDragOver} 
        onDragLeave={() => onFileUploaderDragLeave()}
        >
          {loadingDisplay}
          {fileUploaderDisplay}
          {fileViewerDisplay}

          {/* <div ref={fileListContainerRef} style={{ position: 'relative'}}> */}
          <FileBrowser
            files={paginatedData}           
            folderChain={folderChain}
            fileActions={myFileActions}
            onFileAction={handleAction}
            defaultFileViewActionId={ChonkyActions.EnableListView.id}
            clearSelectionOnOutsideClick={true}
            ref={fileBrowserRef}
            disableDragAndDropProvider={false}
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
          <div className="tw:flex tw:items-center tw:justify-between tw:space-x-2 tw:gap-2 tw:border-t tw:border-gray-300 tw:mt-1">             
            <div style={{ display: "flex" }}>
                <div className='tw:whitespace-nowrap'>Items per Page : </div>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                  {[10, 20, 50, 100, 500, 1000].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            {totalPages>1 &&                         
                      <PaginationWithEllipsis totalPages={totalPages} onPageChange={(page) => goToPage(page)} />                                 
                    }
             
          </div>
          </FileBrowser>

          {/* Drag overlays */}
              {/* {itemRects.map(({ id, rect }) => {                
              const file = paginatedData.find(f => f.id === id);              
              return file ? (
                <DraggableOverlay key={id} file={file} rect={rect}/>
              ) : null;
            })} */}
          {/* </div> */}


          {/* <DropZone onDrop={handleDrop} />

          <div style={{ marginTop: 10 }}>
            <h4>Dropped files:</h4>
            <ul>
              {droppedFiles.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          </div> */}
          
      </div>
  )
}

const FileBrowserHeader = (props) => {
  
  const { fileManagerState, fileManagerDispatch } = useContext(Context)
  const {  browseHistory, browseHistoryIndex, } = fileManagerState;
  const { getFiles } = props;
  const [ showHistoryDropDown, setShowHistoryDropDown] = useState(false)
  const [ historyDropDownType, setHistoryDropDownType ] = useState(null)


  useEffect(() => {
    setTimeout(() => {
      const lvlUpSvg = document.getElementsByClassName('fa-level-up-alt')[0];
      if (lvlUpSvg && lvlUpSvg !== null) lvlUpSvg.setAttribute('transform','scale(-1 1)')

      var xpath = "//span[text()='Actions']";
      var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if(matchingElement) matchingElement.innerText = "More..."
      var xpath = "//span[text()='Select all files']";
      var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if(matchingElement) matchingElement.innerText = "Select All"
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
        let showItem = true;
        if (historyDropDownType === "back" && index > browseHistoryIndex) showItem = false;
        else if (historyDropDownType === "forward" && index < browseHistoryIndex) showItem = false;
        if (showItem === true){
          let nameDisplay = h.path === ROOTDIR ? "zynthian" : h.path.indexOf('/') > -1 ? h.path.split('/')[h.path.split('/').length - 1] : h.path;
          let itemCssClass;
          if (index === browseHistoryIndex){
            itemCssClass = "active"
          }
          return (
            <li><a className={itemCssClass} title={h.path} onClick={() => {navigateHistory(index);setShowHistoryDropDown(false)}}>{nameDisplay}</a></li>
          )
        }
      })

    historyDropDownDisplay = (
      <div ref={ref} className={'browser-history-submenu ' + historyDropDownType} >
        <a onClick={() => setShowHistoryDropDown(false)} className='close-browser-history'>
          <AiOutlineCloseCircle/>
        </a>
        <ul>
          {history}
        </ul>
      </div>
    )
  }

  const onBackLongPress = () => {
    setHistoryDropDownType('back')
    setShowHistoryDropDown(true)
  };

  const onForwardLongPress = () => {
    setHistoryDropDownType('forward')
    setShowHistoryDropDown(true)
  }

  const onForwardClick = () => {
    navigateHistory('forward')
  }

  const onBackClick = () => {
    navigateHistory('back')
  }

  const defaultOptions = {
      shouldPreventDefault: true,
      delay: 400,
  };

  const backLongPressEvent = useLongPress(onBackLongPress, onBackClick, defaultOptions);
  const forwardLongPressEvent = useLongPress(onForwardLongPress, onForwardClick, defaultOptions);


  return (
      <div  className='file-navbar-container-custom'>   
        <ul className='browser-navigation-menu'>
          <li><a {...backLongPressEvent}><IoArrowBack/></a></li>
          <li><a {...forwardLongPressEvent}><IoArrowForward/></a></li>
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