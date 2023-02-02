import React, { useRef, useState, useEffect } from 'react';
import useStore from '../../store';
import { baseImagePath } from '../../utils/utility';

const ToolbarIcon = ({ id, name, icon, urls }) => {
  //const updateSavedApps = useStore(state => state.updateSavedApps);
  //const updateWebpagesList = useStore(state => state.updateWebpagesList);
  const setAppContextShortcuts = useStore(
    state => state.setAppContextShortcuts,
  );
  const updateContextApps = useStore(state => state.updateContextApps);

  const [toggle, setToggle] = useState(false);
  const tooltip = useStore(state => state.toolTip);
  const iconRef = useRef(null);
  const setToolTip = useStore(state => state.setToolTip);
  const [size, setSize] = useState(null)

  const handleToggle = async () => {
    setToggle(!toggle)
    if (tooltip.name === name) {
      setToolTip({
        ...tooltip,
        visible: !tooltip.visible,
        size
      })
    } else {
      setToolTip({ visible: true, name, urls, size, id })
    }

    await setAppContextShortcuts(name);
  };

  useEffect(() => {
    if (iconRef.current) {
      const _size = iconRef.current.getBoundingClientRect();
      setSize(prevState => prevState = _size)
      setToolTip({ ...tooltip, size: _size });
    }


  }, [iconRef, toggle]);

  const handleRemove = async (e) => {
    e.stopPropagation()
    updateContextApps(name, 'false');

    setToolTip({ ...tooltip, visible: false })
  };

  return (
    <>
      <div
        data-id={name}
        data-name={name}
        data-type="toolbar"
        className="app-toolbar-icon"
        onClick={() => handleToggle()}
        ref={iconRef}
      >
        <img className="app-icon" src={icon} alt={name} data-tip={name} />

        {tooltip.visible && tooltip.name === name && (
          <>
            <>
              {name !== "Global" && <img
                className="app-icon-remove"
                alt="remove app"
                src={baseImagePath('icons/remove.svg')}
                onClick={handleRemove}
                style={{ zIndex: 99 }}
              />}

              <div className="app-icon-selection-bar"></div>

            </>
          </>
        )}

      </div>


    </>
  );
};

export default ToolbarIcon;
