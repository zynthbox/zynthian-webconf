import React, {PureComponent} from 'react';
import {Treebeard} from 'react-treebeard';

class TreeView extends PureComponent {
    constructor(props){
        console.log(props)
        super(props);
        this.state = {data:props.data};
        this.onToggle = this.onToggle.bind(this);
    }
    
    onToggle(node, toggled){
        const {cursor, data} = this.state;
        if (cursor) {
            this.setState(() => ({cursor, active: false}));
        }
        node.active = true;
        if (node.children) { 
            node.toggled = toggled;
        }
        props.onTreeFolderClick(node)
        this.setState(() => ({cursor: node, data: Object.assign({}, data)}));
    }
    
    render(){
        const {data} = this.state;
        return (
            <div className='tree-view-container'>
                <Treebeard
                    data={data}
                    onToggle={this.onToggle}
                />
            </div>
        );
    }
}

export default TreeView