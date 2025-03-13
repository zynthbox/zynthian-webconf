import React, { useContext, useEffect, useState } from 'react';
import { Context } from './context/context-provider'
import { useDispatch, useSelector } from "react-redux";
import { getSketchpadVersions } from '../../../../store/sketchpad-manager/SketchpadMangerSlice.js';
import { selectFolder } from '../../../../store/sound-manager/SoundManagerSlice';
function TreeView({rootDirectory,mode}){

    const { fileManagerState, fileManagerDispatch } = useContext(Context)
    const dispatch = useDispatch()
    function onTreeItemClick(item,parentIds){

        let treeItemPayload = {
            ...item,
            id:item.folder ? item.folder + item.name : null
        }
        
        if (item.path === rootDirectory){
            treeItemPayload = {
                id:"xcv",
                isDir:true,
                label:rootDirectory,
                name:rootDirectory
            }
        }   
        if(item.isDir){
                fileManagerDispatch({type:'SET_SELECTED_FOLDER',payload:treeItemPayload})                
                // dispatch right panel                           
                if(mode=='sketchpad-manager' && item.level == 4){
                        dispatch(getSketchpadVersions(item.path));  
                    }else if(mode=='sound-manager' && item.level == 3){                                                                           
                        dispatch(selectFolder(item.path+'/'));  
                    }
            }       
    }

    return (
        <div className='tree-view-container'>
            <ul>
                <TreeViewItem 
                    onClick={onTreeItemClick}
                    item={fileManagerState.treeData}
                    mode={mode}
                />
            </ul>
        </div>
    )
}

function TreeViewItem(props){
    
    const { item } = props;

    useEffect(() => {
        setIsToggled(item.toggled)
    },[item.toggled])

    const [ isToggled, setIsToggled ] = useState(!item.children ? false : item.toggled)

    function onItemClick(item,parentIds){
        if (item.children){
            const newIsToggled = isToggled === true ? false : true;
            setIsToggled(newIsToggled)
        }
        props.onClick(item,parentIds)
    }

    let parentIds = [];
    if (item.id){
        parentIds = [...props.parentIds,item.id]
    }
    // console.log(item,"id")
    let itemChildrenDisplay;
    if (item.children && isToggled === true){
        itemChildrenDisplay = (
            <div style={{height:item.toggled === true ? "auto" : "0px",overflow:"hidden"}}>
                <TreeViewSubMenu {...props} items={item.children} parentIds={parentIds} />
            </div>
        )
    }

    let level = item.level;
    if(props.mode=='sketchpad-manager'){
        level = level-2;
    }else if(props.mode=='sound-manager'){                                                                           
        level = level -1;
    }else if(props.mode =='sample-manager'){
        level = level -1;
    }
    
    let l = 8 + ((item && level)?level*12 : 0)
    let p = 25 + ((item && level)?level*15 : 0)
    
    return (
        <li>
            {item.isDir &&
                <span onClick={() => onItemClick(item,parentIds)} className='toggle-sub-menu' style={{ left:l}}>
                    <i className={isToggled=== true ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-right'}></i>
                </span>
            }           
            <a onClick={() => onItemClick(item,parentIds)} style={{paddingLeft:p}} className={item.active === true ? "active" : ""}>
                {item.name} 
            </a>
            {itemChildrenDisplay}
        </li>
    )
}

function TreeViewSubMenu(props){
    const itemsDisplay = props.items.map((item,index) => (
        <TreeViewItem key={index} {...props} item={item} />
    ))

    return (
        <ul>{itemsDisplay}</ul>
    )
}

export default TreeView