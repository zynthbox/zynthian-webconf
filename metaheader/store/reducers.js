import { combineReducers } from 'redux'
import count from './count/countSlice'
import songExport from './songExport/songExportSlice';

const reducers = combineReducers({ 
  count,
  songExport
})

export default reducers;