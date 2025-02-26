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

const getCategoryName =(categoryKey)=>{
      const categoryNameMapping = {
        "0": "Uncategorized",
        "1": "Drums",
        "2": "Bass",
        "3": "Leads",
        "4": "Synth/Keys",
        "5": "Strings/Pads",
        "6": "Guitar/Plucks",
        "99": "FX/Other",
    }
    return categoryNameMapping[categoryKey];   
}

const extractTagsFromSound =(meta,path)=>{
  
//   [{"isValid": true, "path": "/zynthian/zynthian-my-data/sounds/my-sounds/EightiesMemoriestest.snd"
// , "synthSlotsData": ["synthv1 > EightiesMemories", "", "", "", ""]
// , "sampleSlotsData": ["", "", "", "", ""]
// , "fxSlotsData": ["", "", "", "", ""]
// , "category": "4"}]
  //  console.log(meta);
   try{
      let category = getCategoryName(meta['TXXX:ZYNTHBOX_SOUND_CATEGORY'][0]);         
      let sampleSlotsData = ["", "", "", "", ""]
      let synthSlotsData = ["", "", "", "", ""]
      let fxSlotsData =  ["", "", "", "", ""]
      if(meta['TXXX:ZYNTHBOX_SOUND_SAMPLE_SNAPSHOT'][0]){
        let obj = JSON.parse(meta['TXXX:ZYNTHBOX_SOUND_SAMPLE_SNAPSHOT'][0]);                
        let i = 0
        Object.values(obj).forEach(o=>{
          sampleSlotsData[i++] = o['filename']
        })
        
      }

      // #TODO  plugins_helper.update_layer_snapshot_plugin_id_to_name
      let snapshotObj = JSON.parse(meta['TXXX:ZYNTHBOX_SOUND_SYNTH_FX_SNAPSHOT'][0]);           
      let layers = snapshotObj['layers'];
      layers.forEach((l) => {
        if(l['engine_type'] == 'MIDI Synth'){
          if(l['preset_name']){
            synthSlotsData[l['slot_index']] = l['engine_name']+'>'+l['preset_name']
          }
        }else if(l['engine_type'] == 'Audio Effect'){
          if(l['preset_name']){
            fxSlotsData[l['slot_index']]  = l['engine_name']+'>'+l['preset_name']
          }
        }
      });

      // for layer_data in snapshotObj["layers"]:
      // if layer_data["engine_type"] == "MIDI Synth":
      //     layer_data_translated = plugins_helper.update_layer_snapshot_plugin_id_to_name(layer_data)
      //     synthSlotsData[layer_data_translated["slot_index"]] = f"{layer_data_translated['engine_name'].split('/')[-1]} > {layer_data_translated['preset_name']}"
      // elif layer_data["engine_type"] == "Audio Effect":
      //     layer_data_translated = plugins_helper.update_layer_snapshot_plugin_id_to_name(layer_data)
      //     fxSlotsData[layer_data_translated["slot_index"]] = f"{layer_data_translated['engine_name'].split('/')[-1]} > {layer_data_translated['preset_name']}"

      let r = {"isValid":true,path,category,sampleSlotsData,synthSlotsData,fxSlotsData};      
      return r;
    }catch(error)
    {
      console.error(error);
      return {"isValid":false,"erorrString": "Could not open file to read the tags"}
    }

}


export const getSoundMeta = createAsyncThunk(
  "soundmanager/getSoundMeta",
  async (arrgs,{getState}) => {      
    const { soundSelected } = getState().soundmanager;    

    const path = soundSelected.split("/").join("+++");   
      const response = await fetch(`http://${window.location.hostname}:3000/sound/${path}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      });
      const res = await response.json();
      return res;
  }
);

export const initFilesCategories = createAsyncThunk(
  "soundmanager/initFilesCategories",
  async (arrgs,{getState}) => {      
    const { folderSelected } = getState().soundmanager;    
    const path = folderSelected.split("/").join("+++");   
      const response = await fetch(`http://${window.location.hostname}:3000/sound/init/${path}`, {
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
  folderSelected:'/home/pi/zynthian-my-data/sounds/my-sounds/',
  files:[],
  categories:[],
  categorySelected:null,
  soundSelected:null,
  soundInfo:null,  
  status:'',
  error:'',

  // new file tree. not needed now
  tree:[],
  expandedAll:false,
  
}

const SoundManagerSlice = createSlice({
  name: "soundmanager",
  initialState,
  reducers: {
    selectFolder:(state, action) => {      
      state.folderSelected = action.payload
      state.files = []
      state.categories = []
      state.categorySelected = null
      state.soundSelected = null
      state.soundInfo = null
      state.status = ''
      state.error = ''
    },
    selectCategory:(state, action) => {            
      state.categorySelected = action.payload
      state.soundSelected = null
      state.soundInfo = null
      state.status = ''
      state.error = ''
    },

    selectSound: (state, action) => {      
      state.soundSelected = action.payload
      state.soundInfo = null
    },

    toggleTree: (state, action) => {      
      state.expandedAll = !state.expandedAll
    },

  },
  extraReducers: (builder) => {
    // new tree.not now
    // builder.addCase(getSketchpadFileTree.fulfilled, (state, action) => {
    //   state.tree = [action.payload];
    //   state.status = "idle";
    // });
    // builder.addCase(getSketchpadFileTree.pending, (state) => {
    //   state.status = "loading";      
    // });
    // builder.addCase(getSketchpadFileTree.rejected, (state, action) => {
    //   state.error = action.error.message;
    //   state.status = "failed";
    // });

    // initFilesCategories
    builder.addCase(initFilesCategories.fulfilled, (state, action) => {                
      state.files = action.payload.files;     
      state.categories =  action.payload.categories;     
      state.status = "idle";
    });
    builder.addCase(initFilesCategories.pending, (state) => {
      state.status = "loading";      
    });
    builder.addCase(initFilesCategories.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });

    // getSoundInfo
    builder.addCase(getSoundMeta.fulfilled, (state, action) => {            
      if(action.payload.isValid){
        state.soundInfo = action.payload;      
      }else{
        state.soundInfo = null;
        state.error = action.payload.erorrString   
        state.status = action.payload.erorrString ;   
      }
      state.status = "idle";      
    });
    builder.addCase(getSoundMeta.pending, (state) => {
      state.status = "loading";      
    });
    builder.addCase(getSoundMeta.rejected, (state, action) => {
      
      state.soundInfo = null;
      state.error = action.error.message;
      state.status = "failed";
    });
    

  }
  })

export const {
    selectFolder,
    selectCategory,
    selectSound,    
    toggleTree } = SoundManagerSlice.actions;
  
export default SoundManagerSlice.reducer