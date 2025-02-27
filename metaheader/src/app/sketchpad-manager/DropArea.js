import React,{useState} from 'react'
import "./DropArea.css";

function DropArea({ onDrop }) {
    const [showDrop, setShowDrop] = useState(false);
    return (
      <li
        onDragEnter={() => setShowDrop(true)}
        onDragLeave={() => setShowDrop(false)}
        onDrop={() => {
          onDrop();
          setShowDrop(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        className={showDrop ? "drop_area" : "hide_drop"}
      >
        Drop Here
      </li>
    );
}

export default DropArea