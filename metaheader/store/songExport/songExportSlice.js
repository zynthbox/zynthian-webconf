import {createSlice} from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getSketches = createAsyncThunk(
    'songExport/fetchSketches',
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
    sketches:[],
    selectedSong:null,
    exports:[],
    selectedExport:null,
    parts:[],
    selectedPart:null,
    status: {
        sketches:'idle',
        exports:'idle',
        parts:'idle'
    },
    error:''
}

const songExportSlice = createSlice({
  name: 'songExport',
  initialState,
  reducers: {
    dismissError: (state, action) => {
        state.error = ''
        state.status.sketches = 'idle';
        state.status.exports = 'idle';
        state.status.parts = 'idle';
    },
    setSelectedSong: (state, action) => {
        state.selectedSong = action.payload
    },
    setSelectedExport: (state, action) => {
        state.selectedExport = action.payload
    }
  },
  extraReducers: (builder) => {

    // SKETCHES
    builder.addCase(getSketches.fulfilled, (state, action) => {
        state.sketches = action.payload
        state.status.sketches = 'idle'
    })
    builder.addCase(getSketches.pending, (state) => {
        state.status.sketches = 'loading'
        state.sketches = []
        state.exports = []
        state.parts = []
    })
    builder.addCase(getSketches.rejected, (state, action) => {
        state.error = action.error.message
        state.status.sketches = 'failed'
    })
    
    // EXPORTS
    builder.addCase(getSongExports.fulfilled, (state, action) => {
        state.exports = action.payload
        state.status.exports = 'idle'
    })
    builder.addCase(getSongExports.pending, (state) => {
        state.status.exports = 'loading'
        state.exports = []
        state.parts = []
    })
    builder.addCase(getSongExports.rejected, (state, action) => {
        state.error = action.error.message
        state.status.exports = 'failed'
    })

    // PARTS
    builder.addCase(getExportParts.fulfilled, (state, action) => {
        state.parts = action.payload
        state.status.parts = 'idle'
    })
    builder.addCase(getExportParts.pending, (state) => {
        state.status.parts = 'loading'
        state.parts = []
    })
    builder.addCase(getExportParts.rejected, (state, action) => {
        state.error = action.error.message
        state.status.parts = 'failed'
    })

  },
})

export const { dismissError, setSelectedSong, setSelectedExport } = songExportSlice.actions

export default songExportSlice.reducer