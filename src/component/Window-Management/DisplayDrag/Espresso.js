/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import 'react-rangeslider/lib/index.css';
import { baseImagePath, TextTruncate } from '../../../utils/utility';
import useStore from '../../../store';
import ArrangementIcons from './ArrangementIcons';
import ArrangementLayout from './ArrangementLayout';

const displaysSelector = state => state.displays;

const Espresso = ({
  setRotateDislay,
  item,
  isPause,
  setIsPause,
  isDraging,
  isOpen,
  setIsOpen,
}) => {
  const menuRef = useRef(null);
  const [listening, setListening] = useState(false);
  const theme = useStore(state => state.theme);
  const displays = useStore(displaysSelector);
  const displayToggled = useStore(state => state.displayToggled);
  const setDisplayState = useStore(state => state.setDisplayState);
  const updateWorkspaceDisplays = useStore(
    state => state.updateWorkspaceDisplays,
  );
  const [enlargedSize, setEnlargedSize] = useState({
    width: item.width,
    height: item.height,
  });
  const setDisplayToggled = useStore(state => state.setDisplayToggled)

  useEffect(() => {
    // console.log("In Espresso.js: calling UpdateWorkspaceDisplays: ", item);
    updateWorkspaceDisplays(item.id, { arrangement: item.arrangement }, item.orientation);
  }, [])

  const handleArrangementClick = (e, value) => {
    e.stopPropagation();
    updateWorkspaceDisplays(item.id, { arrangement: value }, item.orientation);
  };

  let storeDisplayIndex = displays.findIndex(display => display.id === item.id);
  let storeDisplay = null;
  if (storeDisplayIndex > -1) {
    storeDisplay = displays[storeDisplayIndex];
  }

  const getDegreeTranslate = display => {
    if (display.degree === 90) return '25%,50%';
    if (display.degree === 270) return '-25%,-50%';
    return '0%,0%';
  };

  const defaultDisplay = {
    left: 0,
    right: 90,
    inverted: 180,
    normal: 270,
    degree: 0,
  };

  const [displaySetting, setDisplaySetting] = useState(defaultDisplay);
  const [display, setDisplay] = useState(
    displayToggled.state && displayToggled.id === item.id,
  );

  useEffect(() => {
    if (storeDisplay) {
      let name;
      if (storeDisplay.orientation === 0) name = 'normal';
      if (storeDisplay.orientation === 90) name = 'right';
      if (storeDisplay.orientation === 180) name = 'inverted';
      if (storeDisplay.orientation === 270) name = 'left';

      setDisplaySetting({
        ...displaySetting,
        [name]: true,
        degree: item.orientation ? item.orientation : storeDisplay.orientation,
      });
    }

    return () => { };
  }, [storeDisplay]);

  useEffect(() => {
    if (displays.length > 0) {
      setDisplay(false);
      setDisplayState(item.id, false);
    }
  }, [displays.length]);

  useEffect(() => {
    if (displayToggled.id === item.id && displayToggled.state) {
      setDisplay(true)
    }
  }, [displayToggled])


  const handleDisplay = () => {
    setDisplayToggled({ id: item.id, state: !display })
    setDisplay(!display);
    if (display) {
      setIsPause(false)
    } else {
      setIsPause(true)
    }
    // setDisplay(!display);
    // setIsPause(!isPause);
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
          setDisplayState(item.id, false);
        });
      });
    };
  };

  useEffect(() => {
    if (!isOpen) {
      setDisplay(false);
      setIsPause(false);
    }
  }, [isOpen]);

  useEffect(
    listenForOutsideClicks(listening, setListening, menuRef, setIsOpen),
  );

  const padingSpace = 4;
  const screenStyle = {
    width: [90, 270].includes(item.orientation)
      ? enlargedSize.height - padingSpace
      : enlargedSize.width - padingSpace,
    height: [90, 270].includes(item.orientation)
      ? enlargedSize.width - padingSpace
      : enlargedSize.height - padingSpace,
  };

  useEffect(() => {
    if (menuRef.current) {
      if (display) {
        const newHeight = 150;
        const newWidth = (item.width / item.height) * newHeight;
        setEnlargedSize({ width: newWidth, height: newHeight });
      } else {
        setEnlargedSize({ width: item.width, height: item.height });
      }
    }
  }, [menuRef, display, item]);

  useEffect(() => {
    const parent = menuRef.current.parentNode;
    parent.style.width = enlargedSize.width + 'px';
    parent.style.height = enlargedSize.height + 'px';
    if (display) {
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
  }, [enlargedSize, display, item]);

  return (
    <div
      className={`es_func_device_img ${isPause && !display ? 'es_device_box_opacity_img' : ''
        }`}
      style={{
        height: '100%',
      }}
      ref={menuRef}
    >
      <div className={`es_device_box unselectable`} style={{ height: '100%' }}>
        <span
          className={`cursor-pointer`}
          onClick={() => {
            handleDisplay();
          }}
          style={{ height: '100%' }}
        >
          <span
            style={{ height: '100%', position: 'relative', zIndex: '2' }}
            className={`screen-span-workspace`}
          >
            {item.type === 'non-espresso' &&
              [null, false].includes(item.is_mirror) && (
                <div
                  className={
                    theme === 'light'
                      ? 'non-espresso-screen'
                      : 'non-espresso-screen-dark'
                  }
                  style={{
                    transform: `rotate(${item.orientation
                      }deg) translate(${getDegreeTranslate({ degree: item.orientation })})`,
                    ...screenStyle,
                  }}
                >
                  <ArrangementLayout
                    displayId={item.id}
                    displayType={item.type}
                    displayName={item.name}
                    active={display}
                    rotation={item.orientation || 0}
                    arrangement={item.arrangement}
                    apps={item.apps}
                  />
                </div>
              )}
            {item.type !== 'non-espresso' &&
              [null, false].includes(item.is_mirror) && (
                <div
                  className={
                    theme === 'light'
                      ? 'non-espresso-screen'
                      : 'non-espresso-screen-dark'
                  }
                  style={{
                    transform: `rotate(${item.orientation
                      }deg) translate(${getDegreeTranslate({ degree: item.orientation })})`,
                    ...screenStyle,
                  }}
                >


                  <ArrangementLayout
                    displayId={item.id}
                    displayType={item.type}
                    displayName={item.name}
                    rotation={item.orientation || 0}
                    active={display}
                    arrangement={item.arrangement}
                    apps={item.apps}
                  />

                </div>


              )}
          </span>

          <ArrangementIcons
            theme={theme}
            display={display}
            arrangement={item.arrangement}
            handleArrangementClick={handleArrangementClick}
          />

          <p
            className={`es_monitor_name_id ${display ? 'es_desplay_id' : ''} ${displaySetting.degree === 90 ? 'es_down_display_id' : ''
              } ${displaySetting.degree === 270 ? 'es_up_display_id' : ''}`}
            style={{ fontSize: '11px !important' }}
          >
            {item.is_main && (
              <img src={baseImagePath('icons/tick.svg')} alt="tick" />
            )}
            {item.name ? item.name : TextTruncate(item.id, 12)}
          </p>

          {display && (
            <div
              className="drag-screen-modal"
              onClick={() => setDisplay(false)}
            ></div>
          )}
        </span>
      </div>
    </div>
  );
};

export default Espresso;
