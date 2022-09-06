import { combineReducers } from 'redux'
import songExport from './songExport/songExportSlice';
import sketchpadXtractor from './sketchpadXtractor/sketchpadXtractorSlice';

const reducers = combineReducers({ 
  songExport,
  sketchpadXtractor
})

export default reducers;