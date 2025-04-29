import React, { useState, useEffect, Suspense, lazy, useContext } from 'react'
import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import LoadingSpinner from '../loading-spinner'
import { usePrevious } from '../helpers'
import { Context } from './context/context-provider';
import ErrorModal from '../components/error-modal';
import TreeView from './tree-view';


setChonkyDefaults({ iconComponent: ChonkyIconFA, disableDragAndDrop:true });

const WebconfFileBrowser = lazy(()=>import('./file-browser'))
// const TreeView = lazy(()=>import('./tree-view'))

const FileManager = ({rootDirectory,mode}) => {

    const { fileManagerState, fileManagerDispatch } = useContext(Context);
    const fsep = "/";
    const [ showFileUploader, setShowFileUploader ] = useState(false);

    const [sf3convertQuality,setSf3convertQuality] = useState(0.6);
    // useEffect(() => {
    //     getFiles();        
    // },[rootDirectory])


    useEffect(() => {
        getFiles();        
    },[fileManagerState.selectedFolder])

    async function getFiles(){
        
        const folder = rootDirectory + (fileManagerState.selectedFolder !== null ? fileManagerState.selectedFolder + "/" : "")               
        fetch(`http://${window.location.hostname}:3000/folder/${folder.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async function(response){
            const res = await response.json();            
            if (!res.errno) {                             
                fileManagerDispatch({type:'SET_FILES',payload:res})
            }
        }).catch(function(err) {            
            fileManagerDispatch({type:'SET_ERROR',payload:{message:`failed to fetch ${folder}`,type:"Folder Error"}})
        });;
    }

    let fileManagerDisplay = <LoadingSpinner/>
    if (fileManagerState.loading === false){
        fileManagerDisplay = (
            <React.Fragment>                
                <TreeView key={rootDirectory} 
                          rootDirectory={rootDirectory} 
                          mode={mode} 
                          treeData={fileManagerState.treeData}
                          sf3convertQuality={sf3convertQuality}
                          setSf3convertQuality={setSf3convertQuality}
                          />
               
                <Suspense fallback={<LoadingSpinner/>}>                     
                    <WebconfFileBrowser
                        fsep={fsep}
                        refreshFileManager={getFiles}
                        showFileUploader={showFileUploader}
                        setShowFileUploader={setShowFileUploader}
                        getFiles={getFiles}
                        rootDirectory={rootDirectory}
                        sf3convertQuality={sf3convertQuality}
                    />
                    
                </Suspense>
               
            </React.Fragment>
        )
    }

    let errorModalDisplay;
    if (fileManagerState.error !== null){
        errorModalDisplay = (
            <ErrorModal
                error={fileManagerState.error}
                onDismiss={() => fileManagerDispatch({type:'SET_ERROR',payload:null})}
            />
        )
    }

    return (
        <div style={{height: window.innerHeight - 170}} className='file-manager-wrapper'>
            {errorModalDisplay}
            {fileManagerDisplay}            
        </div>
    );
};

export default FileManager;
