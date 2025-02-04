import React, { useEffect, useState } from 'react'
import { FaFolder, FaFolderOpen, FaFile } from "react-icons/fa";
import { useSelector,useDispatch } from "react-redux";
import { BsSoundwave } from "react-icons/bs";
import { selectSound } from '../../../store/sound-manager/SoundManagerSlice'; 
const TreeNode = ({ node, searchTerm}) => {

    const [expanded, setExpanded] = useState(false);

    const { expandedAll } = useSelector((state) => state.soundmanager);

    const dispatch = useDispatch();
    useEffect(() => {
        setExpanded(expandedAll)
    },[expandedAll])

    useEffect(() => {
        if(node.level==0) 
        {
            setExpanded(true)
        }
    },[])

    const toggleExpand = () => {
        if (node.isDirectory) {
            setExpanded(!expanded);
        }
    };

    const highlightText = (text, highlight) => {
        if (!highlight) return text;
        const parts = text.split(new RegExp(`(${highlight})`, "gi"));
        return parts.map((part, index) =>
            part.toLowerCase() === highlight.toLowerCase() ? (
                <span key={index} style={{ backgroundColor: "yellow" }}>{part}</span>
            ) : (
                part
            )
        );
    };

    return (
        <div style={{ marginLeft: "20px" }}>
            <div>
                {node.isDirectory &&
                    <a onClick={toggleExpand} style={{ cursor: "pointer" }}>
                    {node.isDirectory ? (expanded ? <FaFolderOpen /> : <FaFolder />) : <FaFile />} {highlightText(node.name, searchTerm)}                                
                    </a>
                }
                {!node.isDirectory &&
                    <a onClick={()=>dispatch(selectSound(node.path))} style={{ cursor: "pointer" }}>
                        <FaFile /> {highlightText(node.name, searchTerm)}                                
                    </a>
                }
            </div>
            {expanded && node.isDirectory && (
                <div>
                    {node.children?.map((child) => ( 
                        <TreeNode key={child.path} node={child} searchTerm={searchTerm}/>
                    ))}
                </div>
            )}
        </div>
    );
};



export default TreeNode