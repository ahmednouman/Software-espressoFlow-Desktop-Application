/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import useStore from '../../../store';
import { baseImagePath, TextTruncate } from '../../../utils/utility';
import ArrangementIcons from './ArrangementIcons';
import ArrangementLayout from './ArrangementLayout';

const setDisplayStateSelector = state => state.setDisplayState;
const displaysSelector = state => state.displays;

const Laptop = ({
  item,
  isPause,
  setIsPause,
  isDraging,
  isOpen,
  setIsOpen,
}) => {
  const menuRef = useRef(null);
  const theme = useStore(state => state.theme);
  const displayToggled = useStore(state => state.displayToggled);
  const [toggle, setToggle] = useState(false);
  const [listening, setListening] = useState(false);
  const setDisplayState = useStore(setDisplayStateSelector);

  const setDisplayToggled = useStore(state => state.setDisplayToggled)
  const displays = useStore(displaysSelector);
  const updateWorkspaceDisplays = useStore(
    state => state.updateWorkspaceDisplays,
  );
  const [enlargedSize, setEnlargedSize] = useState({
    width: item.width,
    height: item.height,
  });

  // const defaultDisplay = {
  //   left: 0,
  //   right: 90,
  //   inverted: 180,
  //   normal: 270,
  //   degree: 0,
  // };

  //const [displaySetting, setDisplaySetting] = useState(defaultDisplay);

  useEffect(() => {
    if (displayToggled.id === item.id && displayToggled.state) {
      setToggle(displayToggled.state)
    }
  }, [displayToggled])

  useEffect(() => {
    updateWorkspaceDisplays(item.id, { arrangement: item.arrangement }, item.orientation);
  }, [])


  const handleArrangementClick = (e, value) => {
    e.stopPropagation();
    updateWorkspaceDisplays(item.id, { arrangement: value }, item.orientation);
  };

  const handleDisplay = () => {
    setDisplayToggled({ id: item.id, state: !toggle })
    setToggle(!toggle);
    if (toggle) {
      setIsPause(false)
    } else {
      setIsPause(true)
    }
  };

  const listenForOutsideClicks = (
    listening,
    setListening,
    menuRef,
    setIsOpen,
  ) => {
    return () => {
      if (listening) return;
      if (!menuRef.current) return;
      setListening(true);
      [`click`, `touchstart`].forEach(type => {
        document.addEventListener(`click`, evt => {
          if (menuRef.current && menuRef.current.contains(evt.target)) return;
          setIsOpen(false);
          setDisplayState(item.id);
        });
      });
    };
  };

  useEffect(
    listenForOutsideClicks(listening, setListening, menuRef, setIsOpen),
  );

  useEffect(() => {
    if (displays.length > 0) {
      setDisplayState();
    }
  }, [displays.length]);

  useEffect(() => {
    if (menuRef.current) {
      if (toggle) {
        const newHeight = 150;
        const newWidth = (item.width / item.height) * newHeight;
        setEnlargedSize({ width: newWidth, height: newHeight });
      } else {
        setEnlargedSize({ width: item.width, height: item.height });
      }
    }
  }, [menuRef, toggle, item]);

  useEffect(() => {
    const parent = menuRef.current.parentNode;
    parent.style.width = enlargedSize.width + 'px';
    parent.style.height = enlargedSize.height + 'px';
    //console.log('toggled', display, displayToggled.state);
    if (toggle) {
      parent.style.position = 'fixed';
      parent.style.left = '50%';
      parent.style.top = '50%';
      parent.style.transform = 'translate3d(-50%,-50%,0)';
      parent.style.zIndex = 3;
    } else {
      parent.style.position = 'absolute';
      parent.style.left = item.left + 'px';
      parent.style.top = item.top + 'px';
      parent.style.transform = 'translate3d(0,0,0)';
      parent.style.zIndex = 2;
    }
  }, [enlargedSize, toggle, item]);

  return (
    <div
      className={`es_device_box es_device_box_opacity unselectable ${isPause && !toggle && 'es_device_box_opacity_img'
        }`}
      style={{ height: '100%' }}
      onClick={handleDisplay}
      ref={menuRef}
    >
      <img
        className="es_devices_img"
        src={baseImagePath(
          theme === 'light'
            ? 'thumbnails/laptop.svg'
            : 'thumbnails/laptop_graphic_white.svg',
        )}
        alt="thumbnails-img"
        style={{ height: '100%' }}
      />
      <ArrangementLayout
        displayId={item.id}
        displayType={item.type}
        displayName={item.name}
        rotation={item.orientation || 0}
        active={toggle}
        arrangement={item.arrangement}
        apps={item.apps}
      />
      <ArrangementIcons
        theme={theme}
        display={toggle}
        arrangement={item.arrangement}
        handleArrangementClick={handleArrangementClick}
      />

      <p
        className={`es_monitor_name_id ${toggle ? 'es_desplay_id' : ''} ${item.orientation === 90 ? 'es_down_display_id' : ''
          } ${item.orientation === 270 ? 'es_up_display_id' : ''}`}
        style={{ fontSize: '11px !important' }}
      >
        {item.is_main && (
          <img src={baseImagePath('icons/tick.svg')} alt="tick" />
        )}
        {item.name ? item.name : TextTruncate(item.id, 12)}
      </p>

      {toggle && (
        <div
          className="drag-screen-modal"
          onClick={() => setToggle(false)}
        ></div>
      )}
    </div>
  );
};

export default Laptop;
