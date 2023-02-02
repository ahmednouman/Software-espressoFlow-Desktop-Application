import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import { baseImagePath, ColorCombinations } from '../../utils/utility';


const WorkspaceTagEditPopup = (props) => {

  const tagOptions = useStore(state => state.workspaceTagOptions);
  const setWorkspaceTagOptions = useStore(state => state.setWorkspaceTagOptions);

  const tagClickedObject = tagOptions[props.tagClickedIndex ? props.tagClickedIndex : 0];

  const workspaceTagEditPopupVisible = useStore(state => state.workspaceTagEditPopupVisible);

  const workspaceTagEditCurrentlyEditingIndex = useStore(state => state.workspaceTagEditCurrentlyEditingIndex);
  const workspaceTagEditCurrentlyEditingObject = tagOptions[workspaceTagEditCurrentlyEditingIndex ? workspaceTagEditCurrentlyEditingIndex : 0];
  const setWorkspaceTagEditCurrentlyEditingIndex = useStore(state => state.setWorkspaceTagEditCurrentlyEditingIndex);

  const workspaceTagEditPopupPosition = useStore(state => state.workspaceTagEditPopupPosition);
  const setWorkspaceTagEditPopupPosition = useStore(state => state.setWorkspaceTagEditPopupPosition);

  const styleTagEditPopup = {
    top: workspaceTagEditPopupPosition.top,
    visibility: workspaceTagEditPopupVisible ? "visible" : "hidden",
  };

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    setWorkspaceTagOptions({
      ...workspaceTagEditCurrentlyEditingObject,
      backgroundColor: ColorCombinations[e.target.id].backgroundColor,
      textColor: ColorCombinations[e.target.id].textColor,
    }, workspaceTagEditCurrentlyEditingIndex);
  };

  const handleTagNameEdit = (e) => {

    e.stopPropagation();
    e.preventDefault();

    // save changes in store
    setWorkspaceTagOptions({ ...workspaceTagEditCurrentlyEditingObject, value: e.target.value, label: e.target.value }, workspaceTagEditCurrentlyEditingIndex);
  };

  const handlePopupClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleFormSubmit = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };


  return (
    <>
      <div className='workspaceTagEditPopup' style={styleTagEditPopup} onClick={handlePopupClick}>
        <form onSubmit={handleFormSubmit}>
          <input
            className='workspaceTagEditInput'
            type='text'
            placeholder='Untitled tag'
            value={workspaceTagEditCurrentlyEditingObject.label}
            onChange={handleTagNameEdit}
            maxLength="12" />
        </form>
        <div className='workspaceTagEditSwatchesGroup'>
          {ColorCombinations.map((color, i) => (
            <div key={i} id={i} className='workspaceTagEditSwatch' style={{ backgroundColor: color.backgroundColor }} onClick={handleClick} >

              <img
                className={color.backgroundColor === workspaceTagEditCurrentlyEditingObject.backgroundColor ? "selected-tag-color-icon-visible" : "selected-tag-color-icon-hidden"}
                alt="selected color"
                src={color.textColor === 'rgba(48, 48, 48, 1)' ? baseImagePath('icons/tick_black.svg') : baseImagePath('icons/tick_white.svg')}
              />

            </div>
          ))}
        </div>
        {/* <a className='workspaceTagEditButton'>Delete</a> */}

      </div>
    </>
  );
};

export default WorkspaceTagEditPopup;
