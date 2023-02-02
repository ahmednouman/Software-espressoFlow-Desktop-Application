import React, { useState, useEffect, useRef } from 'react';
import useStore from '../../../store';
import DragScreen from './DragScreen';
import { Provider } from '../../shared/context';
import {
  snap_displays,
  setCenterAlign,
  findRightItems,
  findBottomItems,
} from '../../Screen-3/CloseDrag';
import { osFinder } from '../../../utils/utility';

const Index = () => {
  //const store = useStore();
  const quitListener = useStore(state => state.quitListener);
  const setQuitListener = useStore(state => state.setQuitListener);
  const disconnect = useStore(state => state.disconnect);
  const setRotateDisplay = useStore(state => state.setRotateDisplay);
  const workspaceDisplays = useStore(state => state.workspaceDisplays);
  const setWorkspaceDisplays = useStore(state => state.setWorkspaceDisplays);

  const [displays, setDisplay] = useState([]);
  const [isPause, setIsPause] = useState(false);
  const [isDraging, setIsDraging] = useState(true);
  const [isMirror, setisMirror] = useState(false);

  const dragContainer = useRef(null);

  useEffect(() => {
    for (let i = 0; i < workspaceDisplays.length; i++) {
      if (workspaceDisplays[i].is_mirror && !osFinder('Mac')) {
        setisMirror(true);
        return;
      }
    }
    setisMirror(false);
  }, [workspaceDisplays]);

  useEffect(() => {
    rearrangeDisplay(workspaceDisplays);
    window.addEventListener('resize', getDisplay);

    return () => {
      window.removeEventListener('resize', getDisplay);
    };
  }, [workspaceDisplays]);

  const getDisplay = async () => {
    let res = workspaceDisplays;
    setDisplay(res);
    rearrangeDisplay(res);
  };

  const rearrangeDisplay = res => {
    if (res.length && dragContainer.current) {
      let parent = dragContainer.current;
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
      if (window && window.electron && !quitListener) {
        window.electron.quitProcess(disconnect);
        setQuitListener(true);
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

        let FinalDisplays2 = ar2.map(e => {
          //console.log((e.left - mainDisplay.left) * onePixelOfScreenLeft);
          return {
            ...e,
            location: {
              ...e.location,
              x: (e.left - mainDisplay.left) * onePixelOfScreenLeft,
              y: (e.top - mainDisplay.top) * onePixelOfScreenTop,
            },
          };
        });

        let FinalDisplays = [...FinalDisplays1, ...FinalDisplays2];

        const updatedWorkspaceDisplays = FinalDisplays.map(e => ({
          ...e,
          id: e.id,
          location: {
            x: parseInt(e.location.x, 10),
            y: parseInt(e.location.y, 10),
          },
        }));
        setWorkspaceDisplays(updatedWorkspaceDisplays);
      }
      if (displays.length === 1) {
        let nDi = [...displays];
        let parent = document.getElementById('dragContainer');
        let leftLoc = parent.offsetWidth / 2 - item.width / 2;
        let topLoc = parent.offsetHeight / 2 - item.height / 2;
        nDi[0].top = topLoc;
        nDi[0].left = leftLoc;
        setDisplay([...nDi]);
        const updatedWorkspaceDisplays = nDi.map(e => ({
          ...e,
          id: e.id,
          location: {
            x: parseInt(e.location.x, 10),
            y: parseInt(e.location.y, 10),
          },
        }));

        setWorkspaceDisplays(updatedWorkspaceDisplays);
      }
    } catch (err) {
      console.log(err.message, 'catch');
    }
  };

  //const mirrorProvider = (id, value) => {};

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
    <div id="dragContainer" ref={dragContainer}>
      <Provider value={{}}>
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
            setIsDraging={() => { }}
            setCloseDragElement={() => { }}
            setRotateDislay={() => { }}
          />
        ))}
      </Provider>
    </div>
  );
};

export default Index;
