import React, { useRef, useState, useEffect } from 'react';
import { ConnectableObservable } from 'rx';
import { isEmpty } from 'underscore';
import useStore from '../../../store';
import { baseImagePath } from '../../../utils/utility';

const ToolbarIcon = ({ id, name, icon, urls, setDisabled }) => {
  const updateSavedApps = useStore(state => state.updateSavedApps);
  const updateWebpagesList = useStore(state => state.updateWebpagesList);
  const [toggle, setToggle] = useState(false);
  const tooltip = useStore(state => state.toolTip);
  const iconRef = useRef(null);
  const setToolTip = useStore(state => state.setToolTip);
  const [isDragging, setDragging] = useState(false);

  const setWorkspaceAppPopupSelectedTab = useStore(state => state.setWorkspaceAppPopupSelectedTab);

  const setWorkspaceAppPopupVisible = useStore(state => state.toggleAppPopupWindow);

  const addWorkspaceApp = useStore(state => state.addWorkSpaceApp);



  useEffect(() => {
    if (iconRef.current) {
      const _size = iconRef.current.getBoundingClientRect();
      setToolTip({ visible: toggle, name, urls, size: _size, id });
    }
  }, [toggle, iconRef]);

  const handleRemove = () => {
    if (urls && urls.length > 0) {
      updateWebpagesList({
        id,
        name,
        icon,
        urls,
        checked: 'false',
      });
    } else {
      updateSavedApps(name, 'false');
    }

    setToggle(false);
    setDisabled(false);
    setToolTip({ ...tooltip, visible: false });
  };

  const addAppToWorkspace = (appClicked) => {
    try {

      const appName = appClicked.getAttribute('data-name');
      const type = appClicked.getAttribute('data-type');
      const originalIndex = appClicked.getAttribute('data-index');


      // setTimeout(() => {
      // addWorkspaceApp(
      //   displayId,
      //   appName,
      //   slotIndex,
      //   // newSlotIndex,
      //   originalIndex,
      //   arrangement,
      //   // newArrangement,
      //   type,
      //   data.rotation,
      // );
      // updateWorkspaceDisplays(displayId, newArrangement);
      // updateWorkspaceDisplays(displayId, { arrangement: newArrangement }, 0);
      // }, 40)

    } catch (error) {
      console.log(error)
    }
  }

  const handleClick = (e) => {
    if (isEmpty(urls)) {
      // console.log("clicking an app icon", e);
      // addAppToWorkspace(e.item);
    }
    else {
      setWorkspaceAppPopupSelectedTab('webpages');
      setWorkspaceAppPopupVisible(true);

    }
  }

  return (
    <>
      <div
        data-id={name}
        data-name={name}
        data-type="toolbar"
        className="app-toolbar-icon"

        onDrag={() => {
          if (tooltip.visible) {
            setToolTip({ ...tooltip, visible: false })
          }

          setDragging(true)
          setToggle(false)
        }}

        onDragEnd={() => {
          setDragging(false)
        }}

        onMouseOut={() => {
          setToggle(false);
        }}
        onMouseOver={() => {
          if (isDragging) return
          setToggle(true);
        }}
        ref={iconRef}
      >
        <img 
          className="app-icon" 
          src={icon.search("tabGroup") > -1 ? baseImagePath('icons/tabGroup.svg') : icon} 
          alt={name} 
          data-tip={name} 
          onClick={handleClick}
        />

        {tooltip.visible && tooltip.name === name && !isDragging && (
          <>
            <img
              className="app-icon-remove"
              alt="remove app"
              src={baseImagePath('icons/remove.svg')}
              onClick={handleRemove}
            />
            <div className="app-icon-selection-bar"></div>
          </>
        )}
      </div>
    </>
  );
};

export default ToolbarIcon;
