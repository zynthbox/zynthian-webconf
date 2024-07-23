import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SketchPadXtractorColumn from "./sketchpadXtractorColumn";
import { BsFillFolderFill, BsViewList } from "react-icons/bs";
import { GoVersions } from "react-icons/go";
import { HiCollection } from "react-icons/hi";
import { GiMagnifyingGlass } from "react-icons/gi";
import {
  getSketchpad,
  getSketchpadVersions,
  setFolder,
  setVersion,
  setScene,
  setClips,
  setTracks,
  setSongs,
  setPatterns,
  getPatterns,
  getSamples,
  getSounds,
  setItemGroupsReady,
  setItemGroup,
  setItem,
} from "./sketchpadXtractorSlice";

function SketchpadXtractor(props) {
  const { colorsArray } = props;
  const {
    status,
    error,
    statusItem,
    folders,
    folder,
    versions,
    version,
    sketchpad,
    scene,
    itemGroups,
    itemGroupTypes,
    itemGroup,
    item
  } = useSelector((state) => state.sketchpadXtractor);
  const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
  const dispatch = useDispatch();

  useEffect(() => {
    if (folder !== null) dispatch(getSketchpadVersions(folder));      
  }, [folder]);
  useEffect(() => {
    if (version !== null) dispatch(getSketchpad(version));
  }, [version]);
  useEffect(() => {
    if (scene !== null) handleSceneSelection();
  }, [scene]);

  useEffect(() => {
    if (itemGroups !== null){
      let isReady = true;
      itemGroupTypes.forEach(function(igt,index){
        if (itemGroups[igt] === null) isReady = false
      })
      if (isReady){
        dispatch(setItemGroupsReady())
      }
    }
  },[itemGroups])


  function handleSceneSelection() {
    // CLIPS
    let newClips = [];
    sketchpad.tracks.forEach(function (channel, index) {
      channel.clips.forEach(async function (part, pIndex) {
        const cIndex = letters.findIndex((letter) => letter === scene);
        if (typeof part[cIndex] !== 'undefined' && part[cIndex].path !== null) {
          const clip = {
            ...part[cIndex],
          };
          clip.track = index;
          newClips.push(clip);
        }
      });
    });
    dispatch(setClips(newClips));
    dispatch(setTracks([]))
    dispatch(setSongs([]))
    dispatch(getPatterns())
    dispatch(getSamples({version,channels:sketchpad.tracks}))
    dispatch(getSounds())
  }

  

  let sketchVersionColumnDisplay;
  if (versions !== null) {
    sketchVersionColumnDisplay = (
      <SketchPadXtractorColumn
        type="versions"
        items={versions}
        onSelectItem={(val) => dispatch(setVersion(val))}
        color={colorsArray[1]}
      />
    );
  }

  let sketchScenesColumnDisplay;
  if (sketchpad !== null) {
    sketchScenesColumnDisplay = (
      <SketchPadXtractorColumn
        type="scenes"
        onSelectItem={(val) => {if(val!=scene) dispatch(setScene(val))}}
        item={scene}
        color={colorsArray[2]}
        letters={letters}
      />
    );
  }

  let sketchItemGroupColumnDisplay;
  if (statusItem === "item groups" && status === "idle"){
      sketchItemGroupColumnDisplay = (
          <SketchPadXtractorColumn
              type={"item groups"}
              items={itemGroups}
              subType={itemGroup}
              onSelectItem={val => dispatch(setItemGroup(val))}
              color={colorsArray[3]}
           />
      )
  } else if (statusItem === "item groups" && status === "loading"){
    sketchItemGroupColumnDisplay = (
        <div className='loader-container'>
            <div className="lds-ellipsis">
                <div></div><div></div><div></div><div></div>
            </div>
        </div>
    )
  }

  let sketchItemGroupItemsColumnDisplay;
  if (itemGroup !== null){
      const items = itemGroups[itemGroup];
      sketchItemGroupItemsColumnDisplay = (
          <SketchPadXtractorColumn
              type={"items"}
              subType={itemGroup}
              items={itemGroups[itemGroup]}
              onSelectItem={val => dispatch(setItem(val))}
              color={colorsArray[4]}
           />
      )
  }

  let sketchItemSelectedItemColumnDisplay;
  if (item !== null){
      sketchItemSelectedItemColumnDisplay  = (
          <SketchPadXtractorColumn
              type={"item"}
              subType={itemGroup}
              item={item}
              // onSelectItem={setSelectedSketchItemGroupItem}
              color={colorsArray[5]}
          />
      )
  }

  return (
    <div id="sketch-pad-xtractor">
      <div className="sketch-pad-xtractor-row">
        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[0] }}
        >
          <h4>
            <BsFillFolderFill />
            Folders
          </h4>
          <SketchPadXtractorColumn
            type="folders"
            items={folders}
            onSelectItem={(val) => { if(val!=folder) dispatch(setFolder(val))}}
            color={colorsArray[0]}
          />
        </div>
        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[1] }}
        >
          <h4>
            <GoVersions />
            Versions
          </h4>
          {sketchVersionColumnDisplay}
        </div>
        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[2] }}
        >
          <h4>
            <BsViewList />
            Scenes
          </h4>
          {sketchScenesColumnDisplay}
        </div>
        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[3] }}
        >
          <h4>
            <HiCollection />
            Item Groups
          </h4>
          {sketchItemGroupColumnDisplay}
        </div>
        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[4] }}
        >
          <h4>
            <BsViewList />
            Items
          </h4>
          {sketchItemGroupItemsColumnDisplay}
        </div>
        <div
          className="sketch-pad-xtractor-column"
          style={{ backgroundColor: colorsArray[5] }}
        >
          <h4>
            <GiMagnifyingGlass />
            Details
          </h4>
          {sketchItemSelectedItemColumnDisplay}
        </div>
      </div>
    </div>
  );
}

export default SketchpadXtractor;
