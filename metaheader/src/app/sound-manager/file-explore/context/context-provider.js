import React from 'react';
import FileManagerReducer,{FileManagerInitialState} from './file-manager-reducer';

export const Context = React.createContext();
const Provider = Context.Provider;

const FileManagerContextProvider = (props) => {
  const [ fileManagerState, fileManagerDispatch ] = React.useReducer(FileManagerReducer,FileManagerInitialState);

  return(
    <Provider {...props} value={{
      fileManagerState,fileManagerDispatch
    }}/>
  )
}

export default FileManagerContextProvider;
