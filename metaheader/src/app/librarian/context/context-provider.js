import React from 'react';
import FileManagerReducer,{FileManagerInitialState} from './file-manager-reducer';

export const Context = React.createContext();
const Provider = Context.Provider;

const FileManagerContextProvider = (props) => {
  let initState = FileManagerInitialState;
  if(props.rootDirectory){
    // rewrite initState from parameter
    let browseHistory=[{
                id: "xcv",
                isDir: true,
                label: props.rootDirectory,
                name: props.rootDirectory,
                path: props.rootDirectory
              }];
     let folderChain = [{ 
                id: 'xcv', 
                name: props.rootName, 
                alias:props.rootDirectory , 
                isDir: true 
              }];
      initState.browseHistory = browseHistory;
      initState.folderChain = folderChain;    
      initState.rootDirectory = props.rootDirectory;
      initState.rootName = props.rootName;
  }
  const [ fileManagerState, fileManagerDispatch ] = React.useReducer(FileManagerReducer,FileManagerInitialState);

  return(
    <Provider {...props} value={{
      fileManagerState,fileManagerDispatch
    }}/>
  )
}

export default FileManagerContextProvider;
