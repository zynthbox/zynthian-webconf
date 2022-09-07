import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getSketchpadInfo = createAsyncThunk(
  "sampleEditor/fetchSketchpadInfo",
  async () => {
    const response = await fetch(
      `http://${window.location.hostname}:3000/sketchinfo/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const res = await response.json();
    return res;
  }
);

export const updateSketchpadInfo = createAsyncThunk(
  "sampleEditor/updateSketchpadInfo",
  async ({ filePath, fileName }, { getState }) => {
    const { sketchpadInfo } = getState().sampleEditor;
    let updatedSketchpadInfo = {
      ...sketchpadInfo,
      lastSelectedSketchpad: filePath,
    };
    let json = JSON.stringify(updatedSketchpadInfo);
    const blob = new Blob([json], { type: "application/json" });
    const formData = new FormData();
    const sketchpadInfoFolder = "/home/pi/zynthian-my-data/sessions/";
    formData.append("file", blob, ".cache.json"); // appending file
    const res = await axios.post(
      `http://${window.location.hostname}:3000/upload/${sketchpadInfoFolder
        .split("/")
        .join("+++")}`,
      formData
    );
    return updatedSketchpadInfo;
  }
);

export const getSketchpad = createAsyncThunk(
  "sampleEditor/fetchSketchpad",
  async (arrgs, { getState }) => {
    const { lastSelectedSketchpad } = getState().sampleEditor.sketchpadInfo;
    const response = await fetch(
      `http://${window.location.hostname}:3000/sketch/${lastSelectedSketchpad
        .split("/")
        .join("+++")}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const sketchpad = await response.json();
    const folder =
      lastSelectedSketchpad.split(sketchpad.name)[0] + sketchpad.name + "/";
    let samplesEndpoints = [];
    sketchpad.channels.forEach(function (channel, index) {
      const url = `http://${window.location.hostname}:3000/track/${folder
        .split("/")
        .join("+++")}:${index + 1}`;
      samplesEndpoints.push(url);
    });
    const responses = await axios.all(
      samplesEndpoints.map((endpoint) => axios.get(endpoint))
    );
    responses.forEach(function (res, index) {
      let samples = [null, null, null, null, null];
      if (!res.data.message) samples = res.data;
      sketchpad.channels[index].samples = samples;
    });
    return sketchpad;
  }
);

export const saveSketchpad = createAsyncThunk(
  "sampleEditor/saveSketchpad",
  async (arrgs, { getState }) => {
    const { sketchpadInfo, sketchpad } = getState().sampleEditor;

    let json = JSON.stringify(sketchpad);
    let path = sketchpadInfo.lastSelectedSketchpad;
    if (path.indexOf("/zynthian/") > -1) path = path.split("/zynthian/")[1];
    let fileName = path.split("/")[path.split("/").length - 1];

    const blob = new Blob([json], { type: "application/json" });
    const formData = new FormData();
    const sketchFolderPath = path.split(fileName)[0];
    formData.append("file", blob, fileName); // appending file
    const res = await axios.post(
      `http://${window.location.hostname}:3000/upload/${sketchFolderPath
        .split("/")
        .join("+++")}`,
      formData
    );
    return res.data;
  }
);

export const uploadSamples = createAsyncThunk(
  "sampleEditor/uploadSamples",
  async ({files,channelIndex,sampleIndex},{getState}) => {
    const { sketchpadInfo, sketchpad, channels} = getState().sampleEditor;
    const folder = sketchpadInfo.lastSelectedSketchpad.split(`${sketchpad.name}.sketchpad.json`)[0]
    const selectedFolder = `/${folder.split('zynthian/')[1]}wav/sampleset/sample-bank.${channelIndex + 1}/`

    let uploadSamplesRequests = [];
    files.forEach(function(file,i){
      const formData = new FormData();
      formData.append('file', file); // appending file
      const uploadSampleRequest = axios.post(
        `http://${window.location.hostname}:3000/upload/${selectedFolder.split('/').join('+++')}`, 
        formData 
      )
      uploadSamplesRequests.push(uploadSampleRequest)
    })

    let payloadArray = [];
    const responses = await axios.all(
      [uploadSamplesRequests]
    );
    responses.forEach(function (res, index) {
      payloadArray.push({ data: res.data });
    });
    
    const samplesArray = [null,null,null,null,null]
    let newSamples = [];
    for ( var i in samplesArray){
      if (sampleIndex){
        if (sampleIndex == i){
          newSamples.push({
            path:files[0].name,
            keyZoneStart:0,
            keyZoneEnd:127,
            rootNote:60,
          })
        } else newSamples.push(sketchpad.channels[channelIndex].samples[i])
      } else {
        if (files[i] && files[i].name) {
          newSamples.push({
            path:files[i].name,
            keyZoneStart:0,
            keyZoneEnd:127,
            rootNote:60,
          })
        } else newSamples.push(null)
      }
    }

    let json = JSON.stringify(newSamples);
    const blob = new Blob([json], { type: "application/json" });
    const formData = new FormData();
    formData.append("file", blob, "sample-bank.json"); // appending file
    const uploadSamplesJsonRequest = await axios.post(
      `http://${window.location.hostname}:3000/upload/${selectedFolder.split('/').join('+++')}`, 
      formData 
    )
    return {
      samples:newSamples,
      channelIndex
    };
  }
);

export const removeSamples = createAsyncThunk(
  "sampleEditor/removeSamples",
  async ({channelIndex,sampleIndex},{getState}) => {
    const { sketchpad, sketchpadInfo} = getState().sampleEditor;
    let deleteSampleRequests = []
    if (sampleIndex && sampleIndex !== null){
      const sample = sketchpad.channels[channelIndex].samples[sampleIndex]
      let sampleFilePath = sketchpadInfo.lastSelectedSketchpad.split(`${sketchpad.name}.sketchpad.json`)[0];
      sampleFilePath += `wav/sampleset/sample-bank.${channelIndex}/` + sample.path;
      sampleFilePath = `/home/pi/${sampleFilePath.split('/zynthian/')[1]}`
      const deleteSampleRequest = axios.post(
        `http://${window.location.hostname}:3000/delete/`,
        {fullPath:sampleFilePath}
      )
      deleteSampleRequests.push(deleteSampleRequest)
    }
    console.log(deleteSampleRequests)
    return deleteSampleRequests;
  }
);

let initialState = {
  sketchpadInfo: null,
  sketchpad: null,
  sourcePicker: {
    channelIndex: null,
    sampleIndex: null,
    showSourcePicker: false,
  },
  dropZone: {
    isSampleSet:false,
    channelIndex:null
  }
};

const sampleEditorSlice = createSlice({
  name: "sampleEditor",
  initialState,
  reducers: {
    updateChannelTitle: (state, action) => {
      const { index, title } = action.payload;
      const updatedChannel = {
        ...state.sketchpad.channels[index],
        name: title,
      };
      state.sketchpad.channels[index] = updatedChannel;
    },
    updateChannelSampleModes: (state, action) => {
      const { index, keyZone_mode, channelAudioType } = action.payload;
      const updatedChannel = {
        ...state.sketchpad.channels[index],
        keyZone_mode,
        channelAudioType,
      };
      state.sketchpad.channels[index] = updatedChannel;
    },
    updateChannelColor: (state, action) => {
      const { index, color } = action.payload;
      const updatedChannel = {
        ...state.sketchpad.channels[index],
        color,
      };
      state.sketchpad.channels[index] = updatedChannel;
    },
    setSourcePicker: (state, action) => {
        state.sourcePicker = {
            ...action.payload
        }
    },
    setDropZone: (state, action) => {
      state.dropZone = {
        ...action.payload
      }
    }
  },
  extraReducers: (builder) => {
    // GET SKETCHPAD INFO
    builder.addCase(getSketchpadInfo.fulfilled, (state, action) => {
      state.sketchpadInfo = action.payload;
      state.status = "idle";
    });
    builder.addCase(getSketchpadInfo.pending, (state) => {
      state.status = "loading";
      state.statusItem = "sketchpad Info";
    });
    builder.addCase(getSketchpadInfo.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });

    // UPDATE SKETCHPAD INFO
    builder.addCase(updateSketchpadInfo.fulfilled, (state, action) => {
      state.sketchpadInfo = action.payload;
      state.status = "idle";
    });
    builder.addCase(updateSketchpadInfo.pending, (state) => {
      state.status = "loading";
      state.statusItem = "update sketchpadinfo";
    });
    builder.addCase(updateSketchpadInfo.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });

    // GET SKETCHPAD
    builder.addCase(getSketchpad.fulfilled, (state, action) => {
      state.sketchpad = action.payload;
      state.status = "idle";
    });
    builder.addCase(getSketchpad.pending, (state) => {
      state.status = "loading";
      state.statusItem = "sketchpad";
    });
    builder.addCase(getSketchpad.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });

    // SAVE SKETCHPAD
    builder.addCase(saveSketchpad.fulfilled, (state, action) => {
      state.status = "idle";
    });
    builder.addCase(saveSketchpad.pending, (state) => {
      state.status = "loading";
      state.statusItem = "save sketchpad";
    });
    builder.addCase(saveSketchpad.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });

    // UPLOAD SAMPLES
    builder.addCase(uploadSamples.fulfilled, (state, action) => {
      const { channelIndex, samples} = action.payload
      state.sketchpad.channels[channelIndex].samples = samples
      state.sourcePicker.showSourcePicker = false;
      state.dropZone.showDropZone = false;
      state.status = "idle";
    });
    builder.addCase(uploadSamples.pending, (state) => {
      state.status = "loading";
      state.statusItem = "upload samples";
    });
    builder.addCase(uploadSamples.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });

    // REMOVE SAMPLES
    builder.addCase(removeSamples.fulfilled, (state, action) => {
      const { channelIndex, samples} = action.payload
      state.sketchpad.channels[channelIndex].samples = samples
      state.sourcePicker.showSourcePicker = false;
      state.dropZone.showDropZone = false;
      state.status = "idle";
    });
    builder.addCase(removeSamples.pending, (state) => {
      state.status = "loading";
      state.statusItem = "remove samples";
    });
    builder.addCase(removeSamples.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });
  },
});

export const {
  updateChannelTitle,
  updateChannelSampleModes,
  updateChannelColor,
  setSourcePicker,
  setDropZone
} = sampleEditorSlice.actions;

export default sampleEditorSlice.reducer;
