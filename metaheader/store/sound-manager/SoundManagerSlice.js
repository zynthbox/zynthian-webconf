import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'



export const getSketchpadFileTree = createAsyncThunk(
  "soundmanager/getSketchpadFileTree",
  async (arrgs,{getState}) => {      
      const response = await fetch(`http://${window.location.hostname}:3000/tree/mysounds`, {
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
  tree:[],
  expandedAll:false,
  soundSelected:null,
  soundInfo:null,  
  status:'',
  error:''
}

const SoundManagerSlice = createSlice({
  name: "soundmanager",
  initialState,
  reducers: {    
    toggleTree: (state, action) => {      
      state.expandedAll = !state.expandedAll
    },
    selectSound: (state, action) => {      
      state.soundSelected = action.payload
    },
  },
  extraReducers: (builder) => {
    // GET SKETCHPAD
    builder.addCase(getSketchpadFileTree.fulfilled, (state, action) => {
      state.tree = [action.payload];
      state.status = "idle";
    });
    builder.addCase(getSketchpadFileTree.pending, (state) => {
      state.status = "loading";      
    });
    builder.addCase(getSketchpadFileTree.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });

  }
  })



  export const {
    toggleTree,selectSound
  } = SoundManagerSlice.actions;
  
export default SoundManagerSlice.reducer