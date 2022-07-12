import {createSlice} from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getSongs = createAsyncThunk(
    'songExport/fetchSongs',
    async () => {
        const response = await fetch(`http://${window.location.hostname}:3000/songexports`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const res = await response.json()
        return res
    }
)

export const getSongExports = createAsyncThunk(
    'songExport/fetchSongExports',
    async (path, ThunkAPI) => {
        const response = await fetch(`http://${window.location.hostname}:3000/folder/${path.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const res = await response.json()
        return res
    }
)

export const getExportParts = createAsyncThunk(
    'songExport/fetchExportParts',
    async (path, ThunkAPI) => {
        const response = await fetch(`http://${window.location.hostname}:3000/folder/${path.split('/').join('+++')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const res = await response.json()
        return res
    }
)

let initialState = {
    songs:[],
    selectedSong:null,
    exports:[],
    selectedExport:null,
    parts:[],
    selectedPart:null,
    status: 'idle',
    error:''
}

const songExportSlice = createSlice({
  name: 'songExport',
  initialState,
  reducers: {
    dismissError: (state, action) => {
        state.error = ''
        state.status = 'idle';
    },
    setSelectedSong: (state, action) => {
        state.selectedSong = action.payload
    },
    setSelectedExport: (state, action) => {
        state.selectedExport = action.payload
    }
  },
  extraReducers: (builder) => {

    // SONGS
    builder.addCase(getSongs.fulfilled, (state, action) => {
        state.songs = action.payload
        state.status = 'idle'
    })
    builder.addCase(getSongs.pending, (state) => {
        state.status = 'loading'
        state.exports = []
        state.parts = []
    })
    builder.addCase(getSongs.rejected, (state, action) => {
        state.error = action.error.message
        state.status = 'failed'
    })
    
    // EXPORTS
    builder.addCase(getSongExports.fulfilled, (state, action) => {
        state.exports = action.payload
        state.status = 'idle'
    })
    builder.addCase(getSongExports.pending, (state) => {
        state.status = 'loading'
        state.parts = []
    })
    builder.addCase(getSongExports.rejected, (state, action) => {
        state.error = action.error.message
        state.status = 'failed'
    })

    // PARTS
    builder.addCase(getExportParts.fulfilled, (state, action) => {
        state.parts = action.payload
        state.status = 'idle'
    })
    builder.addCase(getExportParts.pending, (state) => {
        state.status = 'loading'
    })
    builder.addCase(getExportParts.rejected, (state, action) => {
        state.error = action.error.message
        state.status = 'failed'
    })

  },
})

export const { dismissError, setSelectedSong, setSelectedExport } = songExportSlice.actions

export default songExportSlice.reducer