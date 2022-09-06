import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getSketchpadVersions = createAsyncThunk(
  "sketchpadXtractor/fetchSketchpadVersions",
  async (folder) => {
    const folderPath = `/home/pi/zynthian-my-data/${folder.path}`
      .split("/")
      .join("+++");
    const response = await fetch(
      `http://${window.location.hostname}:3000/mydata/${folderPath}`,
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

export const getSketchpad = createAsyncThunk(
  "sketchpadXtractor/fetchSketchpad",
  async (version) => {
    const versionPath = version.path.split("/").join("+++");
    const response = await fetch(
      `http://${window.location.hostname}:3000/sketch/${versionPath}`,
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

export const getSamples = createAsyncThunk(
  "sketchpadXtractor/fetchSamples",
  async ({ version, channels }) => {
    const fileName =
      version.path.split("/")[version.path.split("/").length - 1];
    const folderName = version.path.split(fileName)[0];
    let samplesRequestEnpoints = [];
    channels.forEach(function (channel, index) {
      const trackUrl = `${folderName
        .split("/")
        .join("+++")
        .split(" ")
        .join("%20")}:${index + 1}`;
      samplesRequestEnpoints.push(
        `http://${window.location.hostname}:3000/track/${trackUrl}`
      );
    });
    let payloadArray = [];
    const responses = await axios.all(
      samplesRequestEnpoints.map((endpoint) => axios.get(endpoint))
    );
    responses.forEach(function (res, index) {
      payloadArray.push({ data: res.data });
    });
    return payloadArray;
  }
);

export const getSounds = createAsyncThunk(
  "sketchpadXtractor/fetchSounds",
  async () => {
    const lastStateZssPath =
      "/home/pi/zynthian-my-data/snapshots/last_state.zss";
    const lastStateZssResponse = await fetch(
      `http://${window.location.hostname}:3000/json/${lastStateZssPath
        .split("/")
        .join("+++")}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const res = await lastStateZssResponse.json();
    return res;
  }
);

export const getPatterns = createAsyncThunk(
  "sketchpadXtractor/fetchPatters",
  async (arrgs, { getState }) => {
    const { version, sketchpad , scene } = getState().sketchpadXtractor;
    const folderPath = `${version.path.split(sketchpad.name)[0]}/sequences/`
      .split("/")
      .join("+++");
    const response = await fetch(
      `http://${window.location.hostname}:3000/mydata/${folderPath}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const files = await response.json();
    let patternRequestsEndpoints = [];
    files.forEach(function(file){
        if (file.path.indexOf('.pattern.json') > -1){
            let fileName = file.path.split('/')[file.path.split('/').length - 1];
            if (fileName.split('.')[0].indexOf(scene) > -1){
                patternRequestsEndpoints.push( `http://${window.location.hostname}:3000/json/${file.path.split('/').join('+++')}`)
            }
        }
    })
    let payloadArray = [];
    const responses = await axios.all(
        patternRequestsEndpoints.map((endpoint) => axios.get(endpoint))
    );
    responses.forEach(function (res, index) {
        let pattern = res.data
        pattern.name = patternRequestsEndpoints[index].split('+++').join('/').split('/patterns/')[1].split('.pattern.json')[0];
        payloadArray.push(pattern);
    });

    return payloadArray;
  }
);

let initialState = {
  folders: [{ path: "sketchpads/my-sketchpads/" }],
  letters: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
  itemGroupTypes: ["clips", "patterns", "samples", "sounds", "tracks", "songs"],
  folder: null,
  versions: [],
  version: null,
  sketchpad: null,
  scene: null,
  itemGroups: {
    clips: null,
    patterns: null,
    samples: null,
    sounds: null,
    tracks: null,
    songs: null,
  },
  itemGroup: null,
  item: null,
  itemDetails: null,
  status: null,
  statusItem: null,
  error: null,
};

const sketchpadXtractorSlice = createSlice({
  name: "sketchpadXtractor",
  initialState,
  reducers: {
    setFolder: (state, action) => {
        state.versions = null;
        state.version = null;
        state.scene = null;
        state.itemDetails = null
        state.itemGroup = null
        state.item = null
        state.folder = action.payload;
    },
    setVersion: (state, action) => {
      state.scene = null;
      state.itemDetails = null
      state.itemGroup = null
      state.item = null
      state.version = action.payload;
    },
    setScene: (state, action) => {
        state.itemDetails = null
        state.itemGroup = null
        state.item = null
        state.scene = action.payload;
        state.statusItem = "item groups";
        state.status = "loading";
    },
    setClips: (state, action) => {
      state.itemGroups.clips = action.payload;
    },
    setTracks: (state, action) => {
      let tracks = [];
      if (action.payload) tracks = action.payload;
      state.itemGroups.tracks = tracks;
    },
    setSongs: (state, action) => {
      state.itemGroups.songs = [];
    },
    setPatterns: (state, action) => {
      state.itemGroups.patterns = [];
    },
    setItemGroupsReady: (state, action) => {
      state.statusItem = "item groups";
      state.status = "idle";
    },
    setItemGroup: (state, action) => {
        state.item = null
        state.itemDetails = null
        state.itemGroup = action.payload;
    },
    setItem: (state, action) => {
        state.itemDetails = null
        state.item = action.payload;
    },
  },
  extraReducers: (builder) => {
    // VERSIONS
    builder.addCase(getSketchpadVersions.fulfilled, (state, action) => {
      let newSketchVersions = [];
      action.payload.forEach(function (sv, index) {
        if (sv.path.indexOf(state.folder.path) > -1) {
          if (sv.path.indexOf("sketchpad.json") > -1)
            newSketchVersions.push(sv);
        }
      });
      state.versions = newSketchVersions;
      state.status = "idle";
    });
    builder.addCase(getSketchpadVersions.pending, (state) => {
      state.status = "loading";
      state.statusItem = "versions";
    });
    builder.addCase(getSketchpadVersions.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });

    // SKETCHPAD
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

    // SAMPLES
    builder.addCase(getSamples.fulfilled, (state, action) => {
      const samples = [];
      if (action.payload) {
        action.payload.forEach(function (res, index) {
          if (!res.data.message) {
            res.data.forEach(function (sample, sIndex) {
              if (sample !== null) {
                samples.push({
                  ...sample,
                  channel: index,
                  slot: sIndex,
                });
              }
            });
          }
        });
      }
      state.itemGroups.samples = samples;
      state.status = "idle";
    });
    builder.addCase(getSamples.rejected, (state, action) => {
      state.error = action.error.message;
      state.status = "failed";
    });

    // SOUNDS
    builder.addCase(getSounds.fulfilled, (state, action) => {
      const sounds = [];
      const lastStateZss = action.payload;
      state.sketchpad.channels.forEach(function (channel, index) {
        channel.chainedSounds.forEach(function (chainedSound, csIndex) {
          if (chainedSound >= 0) {
            lastStateZss.layers.forEach(function (layer, lIndex) {
              if (
                layer.engine_type === "MIDI Synth" &&
                layer.midi_chan === chainedSound
              ) {
                sounds.push(layer);
              }
            });
          }
        });
      });
      state.itemGroups.sounds = sounds;
    });
    builder.addCase(getSounds.rejected, (state, action) => {
      state.error = action.error.message;
    });

    // PATTERNS
    builder.addCase(getPatterns.fulfilled, (state, action) => {
      let patterns = [];
      if (action.payload) patterns = action.payload;
      state.itemGroups.patterns = patterns;
    });
    builder.addCase(getPatterns.rejected, (state, action) => {
      state.error = action.error.message;
    });
  },
});

export const {
  setFolder,
  setVersion,
  setScene,
  setClips,
  setTracks,
  setSongs,
  setPatterns,
  setItemGroupsReady,
  setItemGroup,
  setItem
} = sketchpadXtractorSlice.actions;
export default sketchpadXtractorSlice.reducer;
