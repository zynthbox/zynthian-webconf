import React, { useState, useEffect } from 'react'
import WebconfFileBrowser from './file-browser';
import TreeView from './tree-view';

const FileManager = () => {

  // console.log(window.location)
  // const rootFolder = "metaheader"

  const rootFolder = "/zynthian-my-data"
  const fsep = "/";

  const [ files, setFiles ] = useState([])
  // console.log(files,"files")
  const [ displayedFiles, setDisplayedFiles ] = useState([])
  // console.log(displayedFiles,"displayed files")
  const [ folderChain, setFolderChain ] = useState([{ id: 'xcv', name: rootFolder, isDir: true }])
  const [ selectedFolder, setSelectedFolder ] = useState(rootFolder)

  const [ treeData, setTreeData ] = useState(null);
  
  useEffect(() => {
    getFiles()
  }, []);

  useEffect(() => {
    generateTreeViewData()
    getDisplayFiles(files)
  },[selectedFolder])

  // useEffect(() => {

  // },[folderChain])

  async function getFiles(){
    const response = await fetch(`http://${window.location.hostname}:3000/mydata`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const res = await response.json();
    setFiles(res);
    setSelectedFolder(rootFolder)
    getDisplayFiles(res);
  }

  function getDisplayFiles(fileList){
    console.log('get displayed files')
    let displayedFilesList = [];
    fileList.forEach(function(f,index){
      // console.log(selectedFolder)
      if (f.path.indexOf(selectedFolder + fsep)){
        const fileName = f.path.split(selectedFolder+fsep)[1];
        if (fileName && fileName.indexOf(fsep) === -1){
          let file = {
            ...f,
            id:index+1,
            isDir:fileName.indexOf('.') > -1 ? false : true,
            name:fileName
          }
          // console.log(file);
          displayedFilesList.push(file);
        }
      }
    });
    setDisplayedFiles(displayedFilesList)
  }

//   function getChildrenRecursive(parent,foldersArray){
//     parent.children.forEach(function(child,index){
//       foldersArray.forEach(function(folder,index){
//         if (folder.indexOf('/') > -1){
//           const name = folder.split('/')[0];
//           if (name.indexOf('/') === -1 && folder.split('/')[0] === child.name){
//             if (!child.children) child.children = []
//             child.children.push({
//               name:name,
//               path:folder,
//               toggled:false
//             })
//           }
//         }
//       })
//       console.log(child)
//       if (child.children ){
//         console.log('child has children')
//         // getChildrenRecursive(child,foldersArray)
//       }
//     })
//   }

    function getTree(array) {
        var levels = [{}];
        array.forEach(function (a) {
            levels.length = a.level;
            levels[a.level - 1].children = levels[a.level - 1].children || [];
            levels[a.level - 1].children.push(a);
            levels[a.level] = a;
            levels[a.level].toggled = false;
        });
        return levels[0].children;
    }

  function generateTreeViewData(){


    const filesArray = [
        {
            "path": "/home/pi/zynthian-my-data/capture"
        },
        {
            "path": "/home/pi/zynthian-my-data/files"
        },
        {
            "path": "/home/pi/zynthian-my-data/files/mod-ui"
        },
        {
            "path": "/home/pi/zynthian-my-data/files/mod-ui/Speaker Cabinets IRs"
        },
        {
            "path": "/home/pi/zynthian-my-data/gjhjkjbb"
        },
        {
            "path": "/home/pi/zynthian-my-data/gweögäerwh"
        },
        {
            "path": "/home/pi/zynthian-my-data/preset-favorites"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_Choir_Padt_Thing.preset.lv2"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_Choir_Padt_Thing.preset.lv2/Choir_Padt_Thing.ttl",
            "size": 73031,
            "modDate": 1643381125534.7292
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_Choir_Padt_Thing.preset.lv2/manifest.ttl",
            "size": 513,
            "modDate": 1643381125538.7292
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_DX_EP.preset.lv2"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_DX_EP.preset.lv2/DX_EP.ttl",
            "size": 70139,
            "modDate": 1643381125538.7292
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_DX_EP.preset.lv2/manifest.ttl",
            "size": 491,
            "modDate": 1643381125538.7292
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_Juno_60_Strings.preset.lv2"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_Juno_60_Strings.preset.lv2/Juno_60_Strings.ttl",
            "size": 70139,
            "modDate": 1643381125542.7292
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_Juno_60_Strings.preset.lv2/manifest.ttl",
            "size": 511,
            "modDate": 1643381125542.7292
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_Square_Bass.preset.lv2"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_Square_Bass.preset.lv2/Square_Bass.ttl",
            "size": 68429,
            "modDate": 1643381125542.7292
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/lv2/Surge_Square_Bass.preset.lv2/manifest.ttl",
            "size": 503,
            "modDate": 1643381125546.7292
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Clavinet_AutoWah.pedalboard"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Clavinet_AutoWah.pedalboard/Clavinet_AutoWah.ttl",
            "size": 10397,
            "modDate": 1643381125262.7363
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Clavinet_AutoWah.pedalboard/addressings.json",
            "size": 2,
            "modDate": 1643381125262.7363
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Clavinet_AutoWah.pedalboard/manifest.ttl",
            "size": 384,
            "modDate": 1643381125262.7363
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Clavinet_AutoWah.pedalboard/presets.json",
            "size": 2413,
            "modDate": 1643381125266.7363
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Clavinet_AutoWah.pedalboard/screenshot.png",
            "size": 609399,
            "modDate": 1643381125270.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Clavinet_AutoWah.pedalboard/thumbnail.png",
            "size": 46067,
            "modDate": 1643381125270.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_FX_Chain.pedalboard"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_FX_Chain.pedalboard/Crazy_FX_Chain.ttl",
            "size": 17966,
            "modDate": 1643381125270.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_FX_Chain.pedalboard/addressings.json",
            "size": 2,
            "modDate": 1643381125270.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_FX_Chain.pedalboard/manifest.ttl",
            "size": 380,
            "modDate": 1643381125270.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_FX_Chain.pedalboard/screenshot.png",
            "size": 2094684,
            "modDate": 1643381125274.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_FX_Chain.pedalboard/thumbnail.png",
            "size": 38969,
            "modDate": 1643381125274.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_Kalimba.pedalboard"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_Kalimba.pedalboard/Crazy_Kalimba.ttl",
            "size": 17372,
            "modDate": 1643381125274.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_Kalimba.pedalboard/addressings.json",
            "size": 2,
            "modDate": 1643381125274.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_Kalimba.pedalboard/manifest.ttl",
            "size": 378,
            "modDate": 1643381125274.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_Kalimba.pedalboard/screenshot.png",
            "size": 2078994,
            "modDate": 1643381125278.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Crazy_Kalimba.pedalboard/thumbnail.png",
            "size": 37997,
            "modDate": 1643381125278.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Rhodes_Vintage.pedalboard"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Rhodes_Vintage.pedalboard/Rhodes_Vintage.ttl",
            "size": 14075,
            "modDate": 1643381125278.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Rhodes_Vintage.pedalboard/addressings.json",
            "size": 2,
            "modDate": 1643381125278.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Rhodes_Vintage.pedalboard/manifest.ttl",
            "size": 380,
            "modDate": 1643381125278.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Rhodes_Vintage.pedalboard/screenshot.png",
            "size": 1427178,
            "modDate": 1643381125282.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/Rhodes_Vintage.pedalboard/thumbnail.png",
            "size": 28847,
            "modDate": 1643381125282.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/default.pedalboard"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/default.pedalboard/Default.ttl",
            "size": 5085,
            "modDate": 1643381125282.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/default.pedalboard/addressings.json",
            "size": 2,
            "modDate": 1643381125282.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/default.pedalboard/manifest.ttl",
            "size": 366,
            "modDate": 1643381125282.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/default.pedalboard/screenshot.png",
            "size": 22568,
            "modDate": 1643381125282.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/mod-ui/pedalboards/default.pedalboard/thumbnail.png",
            "size": 6999,
            "modDate": 1643381125282.736
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/pianoteq"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/puredata"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/puredata/generative"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/puredata/synths"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/zynaddsubfx"
        },
        {
            "path": "/home/pi/zynthian-my-data/presets/zynaddsubfx/XMZ"
        },
        {
            "path": "/home/pi/zynthian-my-data/sequences"
        },
        {
            "path": "/home/pi/zynthian-my-data/sequences/community-sequences"
        },
        {
            "path": "/home/pi/zynthian-my-data/sequences/my-sequences"
        },
        {
            "path": "/home/pi/zynthian-my-data/sessions"
        },
        {
            "path": "/home/pi/zynthian-my-data/sessions/.cache.json",
            "size": 59,
            "modDate": 1644253552620
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches"
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp"
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/.cache"
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/Sketch-1.sketch.json",
            "size": 5099,
            "modDate": 1644253578790
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences"
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0"
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/metadata.sequence.json",
            "size": 41,
            "modDate": 1644253591040
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns"
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns/global-1.pattern.json",
            "size": 25033,
            "modDate": 1644253591040
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns/global-2.pattern.json",
            "size": 25033,
            "modDate": 1644253591040
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns/global-3.pattern.json",
            "size": 25033,
            "modDate": 1644253591050
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns/global-4.pattern.json",
            "size": 25033,
            "modDate": 1644253591050
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns/global-5.pattern.json",
            "size": 25033,
            "modDate": 1644253591050
        },
        {
            "path": "/home/pi/zynthian-my-data/sketches/temp/wav"
        },
        {
            "path": "/home/pi/zynthian-my-data/snapshots"
        },
        {
            "path": "/home/pi/zynthian-my-data/snapshots/000"
        },
        {
            "path": "/home/pi/zynthian-my-data/snapshots/000/001-House In RTP.zss",
            "size": 15149,
            "modDate": 1643381125398.7454
        },
        {
            "path": "/home/pi/zynthian-my-data/snapshots/000/002-FluidR3 GM.zss",
            "size": 42495,
            "modDate": 1643381125398.7454
        },
        {
            "path": "/home/pi/zynthian-my-data/snapshots/000/003-ThreeOnThree.zss",
            "size": 70234,
            "modDate": 1643381125398.7454
        },
        {
            "path": "/home/pi/zynthian-my-data/snapshots/default.zss",
            "size": 32552,
            "modDate": 1643381125410.7454
        },
        {
            "path": "/home/pi/zynthian-my-data/snapshots/last_state.zss",
            "size": 32405,
            "modDate": 1644253581760
        },
        {
            "path": "/home/pi/zynthian-my-data/soundfonts"
        },
        {
            "path": "/home/pi/zynthian-my-data/soundfonts/gig"
        },
        {
            "path": "/home/pi/zynthian-my-data/soundfonts/sf2"
        },
        {
            "path": "/home/pi/zynthian-my-data/soundfonts/sfz"
        },
        {
            "path": "/home/pi/zynthian-my-data/sounds"
        },
        {
            "path": "/home/pi/zynthian-my-data/sounds/community-sounds"
        },
        {
            "path": "/home/pi/zynthian-my-data/sounds/my-sounds"
        },
        {
            "path": "/home/pi/zynthian-my-data/soundsets"
        },
        {
            "path": "/home/pi/zynthian-my-data/soundsets/community-soundsets"
        },
        {
            "path": "/home/pi/zynthian-my-data/soundsets/my-soundsets"
        }
    ]

    let foldersArray = [];
    
    filesArray.forEach(function(file,index){
        const name = file.path.split(selectedFolder+"/")[1];
        if (name.indexOf('.') === -1 || name.split('.')[name.split('.').length - 1] === "lv2"){
        foldersArray.push({
            id:index + 1,
            name:name.indexOf('/') > -1 ? name.split('/')[name.split('/').length - 1] : name,
            level: 1 + ( file.path.indexOf('/') > -1 ? name.split('/').length - 1 : 0 ),
            path:file.path
        })
      }
    })

    console.log(foldersArray);

    let newTreeData = {
        name:'zynthian-my-data',
        toggled:true,
        children:getTree(foldersArray)
    };

    // console.log(newTreeData)

    setTreeData(newTreeData)
  }

  async function createFolder(fullPath){
    console.log({fullPath})
    const response = await fetch(`http://${window.location.hostname}:3000/createfolder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({fullPath})
    });
    const res = await response.json();
    console.log(res,"res after create folder");
    setFiles(res);
    getDisplayFiles(res);
  }

  async function renameFile(previousPath,fullPath){
    console.log({fullPath})
    const response = await fetch(`http://${window.location.hostname}:3000/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({fullPath,previousPath})
    });
    const res = await response.json();
    setFiles(res);
    getDisplayFiles(res);
  }

  async function deleteFiles(paths){
    paths.forEach(async function(fullPath,index){
      console.log({fullPath})
      const response = await fetch(`http://${window.location.hostname}:3000/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify({fullPath})
      });
      const res = await response.json();
      setFiles(res);
      getDisplayFiles(res);
    })
  }

  async function pasteFiles(previousPath,destinationPath){
    console.log({previousPath,destinationPath})
    const response = await fetch(`http://${window.location.hostname}:3000/paste`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({previousPath,destinationPath})
    });
    const res = await response.json();
    setFiles(res);
    getDisplayFiles(res);
  }
  

  let treeViewDisplay;
  if (treeData !== null){
    // console.log(treeData)
    treeViewDisplay = <TreeView data={treeData} />
  }

  return (
    <div className='file-manager-wrapper'>
      {treeViewDisplay}
      <WebconfFileBrowser 
         displayedFiles={displayedFiles}
         selectedFolder={selectedFolder}
         fsep={fsep}
         folderChain={folderChain}
         setFolderChain={setFolderChain}
         setSelectedFolder={setSelectedFolder}
         createFolder={createFolder}
         deleteFiles={deleteFiles}
         renameFile={renameFile}
         pasteFiles={pasteFiles}
      />
    </div>
  );
};

export default FileManager;
