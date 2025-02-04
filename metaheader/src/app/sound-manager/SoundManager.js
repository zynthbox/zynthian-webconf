import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { getSketchpadFileTree,toggleTree } from '../../../store/sound-manager/SoundManagerSlice'; 
import Split from 'react-split'
import TreeView from './TreeView'
import SoundEditor from './SoundEditor';
const SoundManager = () => {
    const { tree } = useSelector((state) => state.soundmanager);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getSketchpadFileTree())        
    },[])

  return (
            <Split className="split" sizes={[40, 60]}>  
            <div className='tree-container'>
                <TreeView data={tree}/>     
            </div> 
            <div>
            <SoundEditor/>
            </div>                                                                             
            </Split>
  )
}
export default SoundManager

