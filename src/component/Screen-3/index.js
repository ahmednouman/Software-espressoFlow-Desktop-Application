/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import useStore from '../../store/index';
import DragScreen from './DragScreen';
import Swip from './Swip';
import { Provider } from '../shared/context';
import HelpMenu from '../shared/help';
import UpdateBanner from '../shared/UpdateBanner';
import { baseImagePath, osFinder } from '../../utils/utility';
import {
  snap_displays,
  setCenterAlign,
  findRightItems,
  findBottomItems,
} from './CloseDrag';
import Block from '../shared/Block';
import ToggleSettings from '../shared/ToggleSettings';
import ModalNotify from '../shared/ModalNotify';

const setLocationSelector = state => state.setLocation;

const buttonStyle = {
  border: 'none',
  cursor: 'pointer',
  position: 'absolute',
  left: '15px',
  top: '15px',
  backgroundColor: 'rgba(255, 255, 255, 0.0)',
};

const ScreenThreeComponent = () => {
  const store = useStore();
  const theme = useStore(state => state.theme);
  const setLocation = useStore(setLocationSelector);
  const setRotateDisplay = useStore(state => state.setRotateDisplay);
  const updateSettingValue = useStore(state => state.updateSettingValue);
  const setMirrorMode = useStore(state => state.setMirrorMode)
  const newFirmwareFlag = useStore(state => state.newFirmwareFlag);
  const updatedFlag = useStore(state => state.updatedFlag);
  const setUpdatedFlag = useStore(state => state.setUpdatedFlag);
  const version = useStore(state => state.version);

  const [displays, setDisplay] = useState([]);
  const [isPause, setIsPause] = useState(false);
  const [isDraging, setIsDraging] = useState(true);

  const storeDisplay = useStore(state => state.displays);
  const [isMirror, setisMirror] = useState(false);

  const espressoV2Found = useStore(state => state.espressoV2Found);

  if (window && window.electron) {
    window.electron.sync(arg => {
      updateSettingValue(arg);
    });
  }

  useEffect(() => {
    if (osFinder('Mac')) {
      store.getFirmwareUpdated();
    }
  }, []);

  const refresh = async () => {
    try {
      await store.reinitialise();
    } catch { }
  };

  useEffect(() => {
    for (let i = 0; i < storeDisplay.length; i++) {
      if (storeDisplay[i].is_mirror) {
        setisMirror(true)
        return
      }
    }
    setisMirror(false);
  }, [storeDisplay]);


  useEffect(() => {
    if (!isMirror) {
      rearrangeDisplay(storeDisplay);
    }

    window.addEventListener('resize', getDisplay);

    return () => {
      window.removeEventListener('resize', getDisplay);
    };
  }, [storeDisplay]);

  const exitMirror = async () => {
    try {
      setisMirror(false);
      for (var i = 0; i < storeDisplay.length; i++) {
        store.setMirrorMode(storeDisplay[i].id, false);
      }
      await store.reinitialise();
    } catch { console.log('exitMirror error') }
  };

  const getDisplay = async () => {
    if (!isMirror) {
      let res = storeDisplay;
      setDisplay(res);
      rearrangeDisplay(res);
    }
  };

  const rearrangeDisplay = res => {
    if (res.length) {
      let parent = document.getElementById('dragContainer');
      let left = parent.offsetWidth / 2;
      let top = parent.offsetHeight / 2;
      let minXLocation = Math.min(...res.map(e => e.location.x));
      const scrn_one_pixel = 15;

      let arry = [];
      for (let i = 0; res.length > i; i++) {
        const scr_width = res[i].resolution.x / scrn_one_pixel;
        const scr_height = res[i].resolution.y / scrn_one_pixel;
        const scr_left = left + res[i].location.x / scrn_one_pixel;
        const scr_top = top + res[i].location.y / scrn_one_pixel;

        const obj = {
          ...res[i],
          left: minXLocation === res[i].location.x ? scr_left : scr_left + 1,
          width: scr_width,
          top: scr_top,
          height: scr_height,
        };
        arry.push(obj);
      }

      const alignDisplay = setCenterAlign(arry);
      setDisplay([...alignDisplay]);
      if (window && window.electron && !store.quitListener) {
        window.electron.quitProcess(store.disconnect);
        store.setQuitListener(true);
      }
    }
  };

  const setCloseDragElement = (withoutCurrentItem, item, top, left) => {
    try {
      let isCollistion = false;
      let collisionDisplay = [...withoutCurrentItem, item];

      let displaysCopy = [...collisionDisplay];

      if (withoutCurrentItem.length && !isPause) {
        const magnetDisplay = snap_displays(
          displaysCopy,
          item,
          true, //isCorner
          isCollistion,
        );
        displaysCopy = [...magnetDisplay];

        let mainDisplay = displaysCopy.find(e => e.is_main),
          onePixelOfScreenLeft = mainDisplay.resolution.x / mainDisplay.width,
          onePixelOfScreenTop = mainDisplay.resolution.y / mainDisplay.height;

        let ar1 = displaysCopy.filter(e => e.is_main);
        let ar2 = displaysCopy.filter(e => !e.is_main);

        let FinalDisplays1 = ar1.map(e => ({
          ...e,
          location: {
            ...e.location,
            x: 0,
            y: 0,
          },
        }));
        let FinalDisplays2 = ar2.map(e => ({
          ...e,
          location: {
            ...e.location,
            x: (e.left - mainDisplay.left) * onePixelOfScreenLeft,
            y: (e.top - mainDisplay.top) * onePixelOfScreenTop,
          },
        }));

        let FinalDisplays = [...FinalDisplays1, ...FinalDisplays2];

        // setDisplay([...FinalDisplays]);
        const upDatedLocation = FinalDisplays.map(e => ({
          id: e.id,
          x: e.location.x,
          y: e.location.y,
        }));
        console.log(upDatedLocation);
        setLocation(upDatedLocation);
      }
      if (displays.length === 1) {
        let nDi = [...displays];
        let parent = document.getElementById('dragContainer');
        let leftLoc = parent.offsetWidth / 2 - item.width / 2;
        let topLoc = parent.offsetHeight / 2 - item.height / 2;
        nDi[0].top = topLoc;
        nDi[0].left = leftLoc;
        setDisplay([...nDi]);
        const upDatedLocation = nDi.map(e => ({
          id: e.id,
          x: e.location.x,
          y: e.location.y,
        }));
        setLocation(upDatedLocation);
      }
    } catch (err) {
      console.log(err.message, 'catch');
    }
  };

  const mirrorProvider = (id, value) => { };

  const setRotateDislay = async (value, item) => {
    let displaysCopy = [...displays];
    const index = displaysCopy.findIndex(e => e.id === item.id);
    if (displaysCopy[index].orientation !== value) {
      const isValue180 = displaysCopy[index].orientation === 0 && value === 180;
      const isOrientation180 =
        displaysCopy[index].orientation === 180 && value === 0;
      const isValue90 = displaysCopy[index].orientation === 270 && value === 90;
      const isOrientation90 =
        displaysCopy[index].orientation === 90 && value === 270;
      if (!isValue180 && !isOrientation180 && !isValue90 && !isOrientation90) {
        const resX = item.resolution.x;
        const resY = item.resolution.y;
        const resWidth = item.width;
        const resHeight = item.height;
        const xSpace = resY - resX;
        const ySpace = resX - resY;
        displaysCopy[index].orientation = value;
        displaysCopy[index].resolution.y = resX;
        displaysCopy[index].resolution.x = resY;
        displaysCopy[index].height = resWidth;
        displaysCopy[index].width = resHeight;

        const rightDisplay = findRightItems(displaysCopy, item)
          .filter(e => e.id !== item.id)
          .map(e => e.id);
        const bottomDisplay = findBottomItems(displaysCopy, item)
          .filter(e => e.id !== item.id)
          .map(e => e.id);
        const fnlDisplay = displaysCopy.map(e => ({
          ...e,
          location: {
            x: rightDisplay.includes(e.id)
              ? e.location.x + xSpace
              : e.location.x,
            y: bottomDisplay.includes(e.id)
              ? e.location.y + ySpace
              : e.location.y,
          },
        }));

        await setRotateDisplay(fnlDisplay);
        const withoutCurrentItem = fnlDisplay.filter(e => e.id !== item.id);
        const currentItem = fnlDisplay.find(e => e.id === item.id);

        setCloseDragElement(
          withoutCurrentItem,
          currentItem,
          currentItem.top,
          currentItem.left,
        );
      }
    }
  };


  return (
    <>
      <div
        className={
          theme === 'light'
            ? 'es_inner_overlay_wrapper'
            : 'es_inner_overlay_wrapper_dark'
        }
        style={{ position: isMirror ? 'relative' : 'revert' }}
      >
        <Swip />
        {isMirror ? (
          <>
            <div className="es_drag_cont unselectable">
              <HelpMenu />
              <button
                style={{
                  ...buttonStyle,
                  height: "28px"
                }}
                onClick={() => refresh()}
              >
                <img
                  src={
                    theme === 'light'
                      ? baseImagePath('icons/refresh.svg')
                      : baseImagePath('icons/refresh_white.svg')
                  }
                  alt="refresh"
                >
                </img>
              </button>
              {(newFirmwareFlag === false && osFinder('Mac') && espressoV2Found === true) ? <UpdateBanner /> : null}
            </div>

            <div className="mirrorContainer">
              <p className={theme === 'light' ? 'text-black' : 'text-white'}
              >
                End mirroring to access display controls
              </p>
              <Block
                url="icons/mirror.svg"
                activeUrl="icons/mirror-dark.svg"
                text="Mirror"
                activeText="End Mirroring"
                click={() => exitMirror()}
                active={true}
                setActive={() => { }}
              />
            </div>
          </>

        ) :

          <>
            <div style={{ height: '100%' }} className="display-walkthrough-1">
              <div className="es_drag_cont unselectable">
                {!isMirror && (
                  <p className={theme === 'light' ? 'text-black' : 'text-white'}>
                    Connect then drag your displays to rearrange
                  </p>
                )}

                <ToggleSettings />
                <HelpMenu />
                <button
                  style={{
                    ...buttonStyle,
                  }}
                  onClick={() => refresh()}
                >
                  <img
                    src={
                      theme === 'light'
                        ? baseImagePath('icons/refresh.svg')
                        : baseImagePath('icons/refresh_white.svg')
                    }
                    data-tip="Refresh"
                    alt="refresh">
                  </img>
                </button>
                {(newFirmwareFlag === false && osFinder('Mac') && espressoV2Found === true) ? <UpdateBanner /> : null}
              </div>
              <div
                className="es_device_inner_wrap es_device_screen3_wrap"
                style={{ height: '100%' }}
              >
                <div
                  className="es_device_cols es_func_device_cols_wrapper"
                  style={{ height: '100%' }}
                >
                  {isMirror ? (
                    <div id="dragContainer" className="" >
                      <Provider value={{}}></Provider>
                    </div>
                  ) : (
                    <div id="dragContainer" >
                      <Provider value={{ mirrorProvider }}>
                        {displays.map((item, index) => (
                          <DragScreen
                            key={index}
                            item={item}
                            setDisplay={setDisplay}
                            displays={displays}
                            index={index}
                            isPause={isPause}
                            setIsPause={setIsPause}
                            isDraging={isDraging}
                            setIsDraging={setIsDraging}
                            setCloseDragElement={setCloseDragElement}
                            setRotateDislay={setRotateDislay}
                          />
                        ))}
                      </Provider>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </>
        }
        {updatedFlag && 
          <ModalNotify title="Your software is now up to date" onClose={() => setUpdatedFlag(false)}>
            <div>
                <div className="container-modal-notify-body">
                    Version {version}
                </div>
                <button 
                  onClick={() => setUpdatedFlag(false)} 
                  className="primary-btn"
                  style={{position: "absolute", bottom: "24px"}}
                >
                  Ok, got it
                </button>
            </div>
          </ModalNotify>
        }
      </div>
      <ReactTooltip place="bottom" effect="solid" className="screen3-tooltip" arrowColor="transparent" backgroundColor="rgba(90, 90, 90, 1)" />
    </>
  );
};

export default ScreenThreeComponent;
