import React, { useContext, useEffect, useState } from 'react';
import { Context } from './context/context-provider'
import { useDispatch, useSelector } from "react-redux";
import { getSketchpadVersions } from '../../../../store/sketchpad-manager/SketchpadMangerSlice.js';

function TreeView(props){

    const { fileManagerState, fileManagerDispatch } = useContext(Context)
    const dispatch = useDispatch()
    function onTreeItemClick(item,parentIds){

        let treeItemPayload = {
            ...item,
            id:item.folder ? item.folder + item.name : null
        }
        
        if (item.path === props.rootDirectory){
            treeItemPayload = {
                id:"xcv",
                isDir:true,
                label:props.rootDirectory,
                name:props.rootDirectory
            }
        }   
        if(item.isDir){
                fileManagerDispatch({type:'SET_SELECTED_FOLDER',payload:treeItemPayload})                
                // dispatch right panel            
                if(item.level ==4){
                        dispatch(getSketchpadVersions(item.path));  
                    }
            }       
    }

    return (
        <div className='tree-view-container'>
            <ul>
                <TreeViewItem 
                    onClick={onTreeItemClick}
                    item={fileManagerState.treeData}
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
    let l = 8 + ((item && item.level)?item.level*12 : 0)
    let p = 25 + ((item && item.level)?item.level*15 : 0)
    
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