import React, { useState, useEffect } from 'react'
import WebconfFileBrowser from './file-browser';
import TreeView from './tree-view';

const FileManager = () => {

    // console.log(window.location)
    // const rootFolder = "metaheader"

    const rootFolder = "/zynthian-my-data"
    const rootFolderChainObject = { id: 'xcv', name: rootFolder, isDir: true }
    const fsep = "/";

    const [ files, setFiles ] = useState([])
    // console.log(files,"files")
    const [ displayedFiles, setDisplayedFiles ] = useState([])
    // console.log(displayedFiles,"displayed files")
    const [ folderChain, setFolderChain ] = useState([rootFolderChainObject])
    console.log(folderChain)
    const [ selectedFolder, setSelectedFolder ] = useState(rootFolder)
    // console.log(selectedFolder)
    const [ treeData, setTreeData ] = useState(null);
  
    useEffect(() => {
        getFiles()
    }, []);

    useEffect(() => {
        if (files && files.length > 0){
            getDisplayFiles(files)
        }
    },[selectedFolder])

    useEffect(() => {
        if (files.length > 0) generateTreeViewData()
    },[files])

    // useEffect(() => {

    // },[folderChain])

    async function getFiles(){
        // const response = await fetch(`http://${window.location.hostname}:3000/mydata`, {
        // method: 'GET',
        // headers: {
        //     'Content-Type': 'application/json',
        // },
        // });
        // const res = await response.json();

        const res =  [
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
            "path": "/home/pi/zynthian-my-data/new"
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
            "modDate": 1644329992080
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
            "modDate": 1644330018070
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
            "modDate": 1644330030380
          },
          {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns"
          },
          {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns/global-1.pattern.json",
            "size": 25033,
            "modDate": 1644330030380
          },
          {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns/global-2.pattern.json",
            "size": 25033,
            "modDate": 1644330030390
          },
          {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns/global-3.pattern.json",
            "size": 25033,
            "modDate": 1644330030390
          },
          {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns/global-4.pattern.json",
            "size": 25033,
            "modDate": 1644330030390
          },
          {
            "path": "/home/pi/zynthian-my-data/sketches/temp/sequences/0/patterns/global-5.pattern.json",
            "size": 25033,
            "modDate": 1644330030390
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
            "modDate": 1644330021020
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

        

        setFiles(res);
        setSelectedFolder(rootFolder)
        getDisplayFiles(res);
    }

    function getDisplayFiles(fileList){
        let displayedFilesList = [];
        fileList.forEach(function(f,index){
            if (f.path.indexOf(selectedFolder + fsep) > -1){
                    const fileName = f.path.split(selectedFolder+fsep)[1];
                    if (fileName && fileName.indexOf(fsep) === -1){
                        console.log('what the fuck')
                        let file = {
                        ...f,
                        id:index+1,
                        isDir:fileName.indexOf('.') > -1 ? false : true,
                        name:fileName
                    }
                    displayedFilesList.push(file);
                }
            }
        });
        setDisplayedFiles(displayedFilesList)
    }

    function getTree(array,id) {
        var levels = [{}];
        array.forEach(function (a) {
            levels.length = a.level;
            levels[a.level - 1].children = levels[a.level - 1].children || [];
            levels[a.level - 1].children.push(a);
            levels[a.level] = a;
            if (levels[a.level] === id) {
                levels[a.level].toggled = true;
                levels[a.level].active = false;
            }
            // levels[a.level].toggled = false;
        });
        return levels[0].children;
    }

    function generateTreeViewData(){

        let foldersArray = [];
        
        files.forEach(function(file,index){
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

        let newTreeData = {
            name:'zynthian-my-data',
            toggled:true,
            active:true,
            children:getTree(foldersArray)
        };

        setTreeData(newTreeData)
    }
    
    function checkIfDirIsInFolderChain(id){
        let idIsInChain = false;
        folderChain.forEach(function(folder,index){
          if (folder.id === id){
            idIsInChain = true
          }
        });
        return idIsInChain;
    }

    function openFiles(data){

        const dirIsInChain = checkIfDirIsInFolderChain(data.id);
  
        let newSelectedFolder,
            newFoldersChain;
  
        // console.log('dir is in chain', dirIsInChain)
  
        if (!dirIsInChain){
          newSelectedFolder = selectedFolder + fsep + data.name;
          newFoldersChain = [...folderChain,data];
        } else {
          newSelectedFolder = selectedFolder.split(data.name)[0] + data.name;
          const folderIndexInChain = folderChain.findIndex(item => item.id === data.id);
          newFoldersChain = [...folderChain.slice(0,folderIndexInChain + 1)]
        }
  
        // console.log(newFoldersChain,"new folder chain")
  
        setFolderChain(newFoldersChain)
        setSelectedFolder(newSelectedFolder)
      
    }

    function treeDataRecursiveRender(item,data){
        item.children.forEach(function(child,index){
            if (child.id === data.id) {
                child.active = data.active;
                child.toggled = data.toggled;
            }
            else child.active = false;
            if (child.children && child.children.length > 0){
                treeDataRecursiveRender(child,data)
            }
        })
    }

    function onTreeItemClick(data){
        let newTreeData = Object.assign({},treeData);
        treeDataRecursiveRender(newTreeData,data)
        setTreeData(newTreeData)
        const newSelectedFolder = rootFolder + data.path.split(rootFolder)[1];

    }

    function refreshFileManager(newFiles){
        console.log("refresh file manager")
        setFiles(newFiles);
        getDisplayFiles(newFiles);
    }

    let treeViewDisplay;
    if (treeData !== null){
        treeViewDisplay = (
            <TreeView 
                data={treeData} 
                onTreeItemClick={onTreeItemClick}
                openFiles={openFiles}
            />
        )
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
                openFiles={openFiles}
                refreshFileManager={refreshFileManager}
            />
        </div>
    );
};

export default FileManager;
