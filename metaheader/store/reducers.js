import { combineReducers } from 'redux'
import songExport from './songExport/songExportSlice';
import sketchpadXtractor from './sketchpadXtractor/sketchpadXtractorSlice';
import sampleEditor from './sampleEditor/sampleEditorSlice';
import filePicker from './filePicker/filePickerSlice';


const reducers = combineReducers({ 
  songExport,
  sketchpadXtractor,
  sampleEditor,
  filePicker
})

export default reducers;