import React, { useContext, useEffect, useState } from 'react';
import { Context } from './context/context-provider'

const ROOTDIR = "/home/pi/";

function TreeView(props){

    const { fileManagerState, fileManagerDispatch } = useContext(Context)

    function onTreeItemClick(item,parentIds){

        let treeItemPayload = {
            ...item,
            id:item.folder ? item.folder + item.name : null
        }
        
        if (item.path === ROOTDIR){
            treeItemPayload = {
                id:"xcv",
                isDir:true,
                label:ROOTDIR,
                name:ROOTDIR
            }
        }   
        fileManagerDispatch({type:'SET_SELECTED_FOLDER',payload:treeItemPayload})
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

    return (
        <li>
            <span onClick={() => onItemClick(item,parentIds)} className='toggle-sub-menu' style={{ left:8 + (item.level * 12)}}>
                <i className={isToggled=== true ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-right'}></i>
            </span>
            <a onClick={() => onItemClick(item,parentIds)} style={{paddingLeft:25 + (item.level * 15)}} className={item.active === true ? "active" : ""}>{item.name} </a>
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