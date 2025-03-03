import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import SoundList from "./SoundList";

const WindowPanel = ({title}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPosition({
      x: window.innerWidth / 2 - size.width / 2,
      y: window.innerHeight / 2 - size.height / 2,
    });
  }, [size]);

  return (
    <>
      {!isOpen && <button onClick={() => setIsOpen(true)}>{title}</button>}

      {ReactDOM.createPortal(
        isOpen && (
          <Draggable handle=".window-header" defaultPosition={position}>
            <div className="window-container" style={{ width: size.width, height: size.height }}>
              <ResizableBox
                width={size.width}
                height={size.height}
                minConstraints={[200, 150]}
                maxConstraints={[800, 600]}
                onResizeStop={(e, { size }) => setSize(size)}
                className="window-panel"
              >
                <div className="window">
                  <div className="window-header">
                    <span>{title}</span>
                    <button onClick={() => setIsOpen(false)}>×</button>
                  </div>
                  <div className="window-content">                   
                    <SoundList/>
                  </div>
                </div>
              </ResizableBox>
            </div>
          </Draggable>
        ),
        document.body
      )}
    </>
  );
};

export default WindowPanel;
