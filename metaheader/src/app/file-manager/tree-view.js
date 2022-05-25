import React, { useContext } from 'react';
import { Context } from './context/context-provider'

function TreeView(props){

    const { fileManagerState, fileManagerDispatch } = useContext(Context)

    function onTreeItemClick(item,parentIds){

        let treeItemPayload = {
            ...item,
            id:item.folder ? item.folder + item.name : null
        }
        
        if (item.path === "/home/pi"){
            treeItemPayload = {
                id:"xcv",
                isDir:true,
                label:"/home/pi/",
                name:"/home/pi/"
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
    let parentIds = [];
    if (item.id){
        parentIds = [...props.parentIds,item.id]
    }
    // console.log(item,"id")
    let itemChildrenDisplay;
    if (item.children){
        itemChildrenDisplay = (
            <div style={{height:item.toggled === true ? "auto" : "0px",overflow:"hidden"}}>
                <TreeViewSubMenu {...props} items={item.children} parentIds={parentIds} />
            </div>
        )
    }

    return (
        <li>
            <span onClick={() => props.onClick(item,parentIds)} className='toggle-sub-menu' style={{ left:8 + (item.level * 12)}}>
                <i className={item.toggled === true ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-right'}></i>
            </span>
            <a onClick={() => props.onClick(item,parentIds)} style={{paddingLeft:25 + (item.level * 15)}} className={item.active === true ? "active" : ""}>{item.name} </a>
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