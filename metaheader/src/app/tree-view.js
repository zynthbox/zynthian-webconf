import React, {PureComponent} from 'react';
import {Treebeard} from 'react-treebeard';


function TreeView(props){

    function onTreeItemClick(item,parentIds){
        console.log(parentIds)
        item.toggled = item.toggled === true ? false : true;
        item.active = true;
        console.log(item);
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
            <span className='toggle-sub-menu'>
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
            <a className={item.active === true ? "active" : ""} onClick={() => props.onClick(item,parentIds)}>{item.name} </a>
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

// const data = {
//     name: 'root',
//     toggled: true,
//     children: [
//         {
//             name: 'parent',
//             children: [
//                 { name: 'child1' },
//                 { name: 'child2',
//                 children: [
//                     { name: 'child1' },
//                     { name: 'child2' }
//                 ] }
//             ]
//         },
//         {
//             name: 'loading parent',
//             loading: true,
//             children: []
//         },
//         {
//             name: 'parent',
//             children: [
//                 {
//                     name: 'nested parent',
//                     children: [
//                         { name: 'nested child 1' },
//                         { name: 'nested child 2' }
//                     ]
//                 }
//             ]
//         }
//     ]
// };

// class TreeView extends PureComponent {
//     constructor(props){
//         super(props);
//         this.state = {data:data};
//         this.onToggle = this.onToggle.bind(this);
//     }
    
//     onToggle(node, toggled){
//         console.log(node);
//         const {cursor, data} = this.state;
//         if (cursor) {
//             this.setState(() => ({cursor, active: false}));
//         }
//         node.active = true;
//         if (node.children) { 
//             node.toggled = toggled;
//         }
//         this.props.openFiles(node)
//         this.setState(() => ({cursor: node, data: Object.assign({}, data)}));
//     }
    
//     render(){
//         const {data} = this.state;
//         return (
//             <div className='tree-view-container'>
//                 <Treebeard
//                     data={data}
//                     onToggle={this.onToggle}
//                 />
//             </div>
//         );
//     }
// }

export default TreeView