import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { parseWebStream,orderTags} from 'music-metadata';

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

const getMeta = async (url) => {
  try {
    // Assuming you have a ReadableStream of an audio file
    // const response = await fetch('http://localhost:3000/zynthian-my-data/sounds/my-sounds/Rubato-Valley.wav');
    // const response = await fetch('http://localhost:3000/zynthian-my-data/sounds/my-sounds/EightiesMemoriestest.snd');
    const response = await fetch(url);
    const webStream = response.body;
    
        // Parse the metadata from the web stream
        const metadata = await parseWebStream(webStream, 'audio/x-wav');
    
        const orderedTags = orderTags(metadata.native['ID3v2.4']);
        // Log the parsed metadata
        console.log(orderedTags);

    } catch (error) {
    console.error('Error parsing metadata:', error.message);
    }
  }

const extractTagsFromSound =(meta)=>{
  
   let category = meta['TXXX:ZYNTHBOX_SOUND_CATEGORY'];
   let samples = meta['TXXX:ZYNTHBOX_SOUND_SAMPLE_SNAPSHOT']
  //  console.log('>>>>>>>>>>>>>>>',JSON.parse(samples[0]));
  return {category:meta['TXXX:ZYNTHBOX_SOUND_CATEGORY']
          , samples:Object.entries(JSON.parse(samples[0]))          
        }

}

export const getSoundInfo = createAsyncThunk(
  "soundmanager/getSoundInfo",
  async (arrgs,{getState}) => {      
    const { soundSelected } = getState().soundmanager;
    let path = (soundSelected.indexOf('/zynthian/')>-1) ? soundSelected.split('/zynthian/')[1] : soundSelected ;   
    let url = `http://${window.location.hostname}:3000/${path}`

    const response = await fetch(url);
    const webStream = response.body;
     // Parse the metadata from the web stream
     const metadata = await parseWebStream(webStream, 'audio/x-wav');    
     const orderedTags = orderTags(metadata.native['ID3v2.4']);
    //  console.log(orderedTags['TXXX:ZYNTHBOX_SOUND_CATEGORY'])
     return extractTagsFromSound(orderedTags);
    // return orderedTags;

    // const path = soundSelected.split("/").join("+++");   
      // const response = await fetch(`http://${window.location.hostname}:3000/sound/${path}`, {
      //     method: 'GET',
      //     headers: {
      //         'Content-Type': 'application/json',
      //     },
      // });
      // const res = await response.json();
      // return res;
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

    // getSoundInfo
    builder.addCase(getSoundInfo.fulfilled, (state, action) => {      
      console.log('>>>>>>>>>SoundManagerSlice getSoundInfo',action.payload)
      state.soundInfo = action.payload;      
      state.status = "idle";
    });
    builder.addCase(getSoundInfo.pending, (state) => {
      state.status = "loading";      
    });
    builder.addCase(getSoundInfo.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });
    

  }
  })



  export const {
    toggleTree,selectSound } = SoundManagerSlice.actions;
  
export default SoundManagerSlice.reducer