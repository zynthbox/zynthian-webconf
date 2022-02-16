import React from 'react';

function TreeView(props){

    function onTreeItemClick(item,parentIds){
        item.toggled = item.toggled === true ? false : true;
        item.active = true;
        props.onTreeItemClick(item,parentIds)
    }

    return (
        <div className='tree-view-container'>
            <ul>
                <TreeViewItem 
                    onClick={onTreeItemClick}
                    item={props.data}
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
    let itemChildrenDisplay, toggleButton;
    if (item.children){
        
        toggleButton = (
            <span className='toggle-sub-menu' style={{ left:8 + (item.level * 12)}}>
                <i className={item.toggled === true ? 'glyphicon glyphicon-chevron-down' : 'glyphicon glyphicon-chevron-right'}></i>
            </span>
        )
        
        itemChildrenDisplay = (
            <div style={{height:item.toggled === true ? "auto" : "0px",overflow:"hidden"}}>
                <TreeViewSubMenu {...props} items={item.children} parentIds={parentIds} />
            </div>
        )
    }

    return (
        <li>
            {toggleButton}
            <a style={{paddingLeft:25 + (item.level * 15)}} className={item.active === true ? "active" : ""} onClick={() => props.onClick(item,parentIds)}>{item.name} </a>
            {itemChildrenDisplay}
        </li>
    )
}

function TreeViewSubMenu(props){
    const itemsDisplay = props.items.map((item,index) => (
        <TreeViewItem {...props} item={item} />
    ))

    return (
        <ul>{itemsDisplay}</ul>
    )
}

export default TreeView