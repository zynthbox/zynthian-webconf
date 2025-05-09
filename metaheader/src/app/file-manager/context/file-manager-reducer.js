import { generateTreeFromArray } from "../helpers/tree-data-helpers";
import { arrayUnique, generateNewFolderChain } from '../helpers/file-manager-helpers';
// import { ROOTDIR } from "../helpers/settings.js";



export const FileManagerInitialState = {
    loading:true,
    rootDirectory:null, // get from provider parameter
    rootName:null,// get from provider parameter
    filesLoading:false,
    selectedFolder:null,
    files:[],
    displayedFiles:[],
    folderChain:[{ 
        id: 'xcv', 
        name: "root", 
        alias:"root" , 
        isDir: true 
    }],
    browseHistory:[{
        id: "xcv",
        isDir: true,
        label: 'root',
        name: 'root',
        path: 'root'
    }],
    browseHistoryIndex:0,
    treeData:null,
    error:null
}

function ProductViewReducer(state,action){
    
    switch(action.type){
        case 'SET_SELECTED_FOLDER':{
            
            let data = action.payload
            const ROOTDIR = state.rootDirectory;
            const rootName = state.rootName;
       

            let dataName = data.name;
            if (data.alias){
                dataName = data.alias
            }

            let idIsInChain = false;
            state.folderChain.forEach(function(folder,index){
              if (folder.id === data.id) idIsInChain = true
            });

            let selectedFolder, folderChain;           
            if (!idIsInChain){
                
                if (state.selectedFolder !== null){
                    const shortPath = data.path.split(ROOTDIR)[1]      
               
                    // bugfix if shortPath=test2 and selectedFolder=test make this logic wrong 
                    // if (shortPath && shortPath.indexOf(state.selectedFolder) === -1){
                    if (shortPath && (shortPath+'/').indexOf((state.selectedFolder+'/')) === -1){
                        selectedFolder = shortPath;
                        folderChain = [
                            ...FileManagerInitialState.folderChain,
                            ...generateNewFolderChain(shortPath,state.files,state.rootDirectory)
                        ]
                    } else {
                        selectedFolder = state.selectedFolder + "/" + dataName 
                        folderChain = [...state.folderChain,data];
                    }
                } else {
                    selectedFolder =  dataName;
                    folderChain = [...state.folderChain,data];
                }

            } else {
                
               selectedFolder = dataName === ROOTDIR ? null : state.selectedFolder.split(dataName)[0] + dataName;            
              const folderIndexInChain = state.folderChain.findIndex(item => item.id === data.id);
              folderChain = [...state.folderChain.slice(0,folderIndexInChain + 1)]
            
            }

            let browseHistory = [ ...state.browseHistory ], browseHistoryIndex;
            if (action.isViewingHistory === true){
                browseHistoryIndex = action.browseHistoryIndex
            } else {                
                if (state.browseHistoryIndex !== state.browseHistory.length - 1  ){
                    browseHistory = [
                        ...state.browseHistory.slice(0,state.browseHistoryIndex + 1),
                        {...data,path:data.path ? data.path : ROOTDIR}
                    ]
                } else {
                    browseHistory = [ ...state.browseHistory, {...data,path:data.path ? data.path : ROOTDIR} ]
                }
                browseHistoryIndex = browseHistory.length - 1;
            }

            // console.log(browseHistory, " BROWSE HISTORY")
            // console.log(selectedFolder, " SELECTED FOLDER PRE UPDATE")

            return {
                ...state,
                selectedFolder,
                folderChain,
                browseHistory,
                browseHistoryIndex
            }
        }
        case 'SET_FILES':{                       
            
            let files = arrayUnique(action.payload.concat(state.files))    
                   
            let displayedFiles = [];
            const ROOTDIR = state.rootDirectory;

            // files.forEach(function(f,index){
            //     let displayFile = false;
            //     if (state.selectedFolder === null && f.folder === ROOTDIR) displayFile = true;
            //     else  {
            //         if (ROOTDIR + state.selectedFolder + "/" + f.name === f.path){
            //             displayFile = true;
            //         }
            //     }
            //     if (displayFile === true && displayedFiles.findIndex(df => df.id === f.id) === -1){
            //         let file = {
            //             ...f,
            //             id:f.path,
            //         }
            //         displayedFiles.push(file);
            //     }
            // });
            // displayedFiles = arrayUnique(displayedFiles)

            displayedFiles = action.payload.map(f=>({...f,id:f.path}));            
            
            let treeData = generateTreeFromArray(files.filter(file => file.isDir === true),state.folderChain,state.selectedFolder,ROOTDIR,state.rootName)
            // let treeData = generateTreeFromArray(files,state.folderChain,state.selectedFolder)  
           
            return {
                ...state,
                files,
                displayedFiles,
                treeData,
                loading:false,
                filesLoading:false
            }
        }
        case 'RENAME_FILE':{

            const { previousPath, fullPath } = action.payload;
            const ROOTDIR = state.rootDirectory;
            const files = state.files.filter(function( file ) {
                return file.path.indexOf(previousPath) === -1;
            });
            
            let treeData = generateTreeFromArray(files.filter(file => file.isDir === true),state.folderChain,state.selectedFolder,ROOTDIR,state.rootName)

            return {
                ...state,
                files,
                treeData
            }
        }
        case 'DELETE_FILES':{

            const paths = action.payload;
            const ROOTDIR = state.rootDirectory;
            const files = state.files.filter(function( file ) {
                let keepFile = true;
                paths.forEach(function(deletePath,index){
                    if (file.path.indexOf(deletePath) > -1 ) keepFile = false
                })
                return keepFile;
            });

            let treeData = generateTreeFromArray(files.filter(file => file.isDir === true),state.folderChain,state.selectedFolder,ROOTDIR,state.rootName)

            return {
                ...state,
                files,
                treeData
            }
        }
        case 'SET_ERROR':{
            const error = action.payload;
            return {
                ...state,
                error
            }
        }
        case 'ON_REFRESH_FILES':{
            return {
                ...state,
                filesLoading:true,
                // displayedFiles:null
            }
        }
    }
}

export default ProductViewReducer;
  