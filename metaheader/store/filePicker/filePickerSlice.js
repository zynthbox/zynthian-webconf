import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'

export const getFolderFiles = createAsyncThunk(
    "sampleEditor/fetchFolderFiles",
    async (arrgs,{getState}) => {
        const { folder } = getState().filePicker
        const response = await fetch(`http://${window.location.hostname}:3000/folder/${folder.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const res = await response.json();
        return res;
    }
);



let initialState = {
    showFilePicker:false,
    mode:'LOAD',
    folder:null,
    initFolder:null,
    type:null,
    files:[],
    selectedFile:null,
    status:null,
    statusItem:null
}

const filePickerSlice = createSlice({
    name: 'filePicker',
    initialState,
    reducers: {
        setFilePicker: (state,action) => {
            const { folder, mode, type } = action.payload
            state.folder = folder;
            state.initFolder = folder;
            state.mode = mode;
            state.type = type;
            state.showFilePicker = true
        },
        hideFilePicker: (state) => {
            state.showFilePicker = false;
        },
        setFolder: (state, action) => {
            state.folder = action.payload
        },
        setSelectedFile: (state, action) => {
            state.selectedFile = action.payload;
        }
    },
    extraReducers: (builder) => {
        // GET FOLDER FILES
        builder.addCase(getFolderFiles.fulfilled, (state, action) => {
            let files = [];
            action.payload.forEach(function(file,index){
                if (state.type !== null){
                    if (file.name.indexOf('.') > -1 ){
                        if (file.name !== '.cache' && file.name.indexOf(state.type) > -1){
                            files.push(file)
                        }
                    } else files.push(file)
                } else files.push(file)
            })
            state.files = files;
            state.status = "idle";
        });
        builder.addCase(getFolderFiles.pending, (state) => {
            state.files = []
            state.status = "loading";
            state.statusItem = "folder files";
        });
        builder.addCase(getFolderFiles.rejected, (state, action) => {
            state.error = action.error.message;
            state.status = "failed";
        });
    }
})

export const { setFilePicker, hideFilePicker, setSelectedFile, setFolder } = filePickerSlice.actions

export default filePickerSlice.reducer