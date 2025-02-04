import React, { useState } from 'react'
import TreeNode from './TreeNode'
import { IoRefreshSharp } from "react-icons/io5";
import { VscCollapseAll } from "react-icons/vsc";
import { VscExpandAll } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { toggleTree,getSketchpadFileTree } from '../../../store/sound-manager/SoundManagerSlice'; 
function TreeView({data}) {
  
    const [searchTerm, setSearchTerm] = useState("");
    const { expandedAll } = useSelector((state) => state.soundmanager);
    const dispatch = useDispatch();
  return (
    <div className='tree-view'>         
            <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={()=>dispatch(getSketchpadFileTree())}><IoRefreshSharp /></button> 
            <button onClick={()=>dispatch(toggleTree())}>{expandedAll ? <VscCollapseAll /> : <VscExpandAll />}</button>
            {data.map((node) => (
                <TreeNode key={node.path} node={node} searchTerm={searchTerm}/>
            ))}
    </div>
  )
}

export default TreeView