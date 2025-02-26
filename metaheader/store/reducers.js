import { combineReducers } from 'redux'
import songExport from './songExport/songExportSlice';
import sketchpadXtractor from './sketchpadXtractor/sketchpadXtractorSlice';
import sampleEditor from './sampleEditor/sampleEditorSlice';
import filePicker from './filePicker/filePickerSlice';
import soundmanager from './sound-manager/SoundManagerSlice';
import sketchpadmanager from './sketchpad-manager/SketchpadMangerSlice'
const reducers = combineReducers({ 
  songExport,
  sketchpadXtractor,
  sampleEditor,
  filePicker,
  soundmanager,
  sketchpadmanager
})

export default reducers;