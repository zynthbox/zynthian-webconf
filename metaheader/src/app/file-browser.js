import React, { Component } from 'react'
 
import ReactFileSystem from 'react-file-system'
 
class MyFileSystem extends Component {
  render () {
    return (
        <ReactFileSystem
            rootDirName="/root/" 
            rootFolderName="/"
        />
    )
  }
}
export default MyFileSystem
