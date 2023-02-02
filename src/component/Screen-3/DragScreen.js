/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef } from 'react';
import Laptop from './Laptop';
import Espresso from './Espresso';

const DragScreen = ({
  setRotateDislay,
  item,
  setDisplay,
  displays,
  index,
  isPause,
  setIsPause,
  isDraging,
  setIsDraging,
  setCloseDragElement,
}) => {
  const drageDiv = useRef();
  const [prevItem, setPrevItem] = useState({ ...item });

  const [isDragActive, setIsDrageActive] = useState(false);

  let elmnt = drageDiv.current;
  var newTop = prevItem.top,
    newLeft = prevItem.left,
    pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0,
    left = 0,
    top = 0,
    displaysCopy = [],
    withoutCurrentItem = [];

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    setIsDrageActive(true);

    function elementDrag(e) {
      setIsDraging(false);
      if (!isPause) {
        window.electron.createBorder(item);
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        left = elmnt.offsetLeft - pos1;
        top = elmnt.offsetTop - pos2;
        newTop = newTop - pos2;
        newLeft = newLeft - pos1;
        displaysCopy = [...displays];
        withoutCurrentItem = displaysCopy.filter((_, i) => index !== i);

        const topCondition =
          top >= 0 &&
          top <= elmnt.offsetParent.offsetHeight - elmnt.offsetHeight;
        if (topCondition) {
          displaysCopy[index].top = top;
        }

        const leftCondition =
          left > 0 && left < elmnt.offsetParent.offsetWidth - elmnt.offsetWidth;
        if (leftCondition) {
          displaysCopy[index].left = left;
        }
        if (navigator.platform.indexOf('Win') > -1) {
          setDisplay(displaysCopy);
        } else {
          if (
            prevItem.top < newTop - 10 ||
            prevItem.top > newTop + 10 ||
            prevItem.left < newLeft - 10 ||
            prevItem.left > newLeft + 10
          ) {
            setDisplay(displaysCopy);
          }
        }
      }
    }

    function closeDragElement() {
      window.electron.removeBorder();
      if (navigator.platform.indexOf('Win') > -1) {
        setCloseDragElement(withoutCurrentItem, item, top, left);
      } else {
        if (
          prevItem.top < newTop - 10 ||
          prevItem.top > newTop + 10 ||
          prevItem.left < newLeft - 10 ||
          prevItem.left > newLeft + 10
        ) {
          setCloseDragElement(withoutCurrentItem, item, top, left);
          setPrevItem({ ...prevItem, top, left });
        }
      }
      document.onmouseup = null;
      document.onmousemove = null;
      elmnt.onmousedown = null;
      setIsDrageActive(false);

      setTimeout(() => {
        setIsDraging(true);
      }, 100);
    }
  }

  const [withoutCurrentItemss, setWithoutCurrentItemss] = useState([]);

  const [touchItems, setTouchItems] = useState({
    top: item.top,
    left: item.left,
  });

  const touchStart = e => {
    e = e || window.event;
    pos3 = e.targetTouches[0].clientX;
    pos4 = e.targetTouches[0].clientY;
  };

  const touchMove = e => {
    var parent = document.getElementById('dragContainer');
    setIsDraging(false);
    if (!isPause) {
      window.electron.createBorder(item);
      e = e || window.event;

      pos1 = pos3 - e.targetTouches[0].clientX;
      pos2 = pos4 - e.targetTouches[0].clientY;
      pos3 = e.targetTouches[0].clientX;
      pos4 = e.targetTouches[0].clientY;
      left =
        e.targetTouches[0].clientX - parent.offsetLeft - elmnt.offsetWidth / 2;

      top =
        e.targetTouches[0].clientY - parent.offsetTop - elmnt.offsetHeight / 2;
      setTouchItems({ ...touchItems, left, top });

      displaysCopy = [...displays];
      withoutCurrentItem = displaysCopy.filter((_, i) => index !== i);
      setWithoutCurrentItemss(withoutCurrentItem);
      const topCondition =
        top >= 0 && top <= elmnt.offsetParent.offsetHeight - elmnt.offsetHeight;
      if (topCondition) {
        displaysCopy[index].top = top;
      }

      const leftCondition =
        left > 0 && left < elmnt.offsetParent.offsetWidth - elmnt.offsetWidth;
      if (leftCondition) {
        displaysCopy[index].left = left;
      }
      setDisplay(displaysCopy);
    }
  };

  const touchEnd = () => {
    window.electron.removeBorder();
    setCloseDragElement(
      withoutCurrentItemss,
      item,
      touchItems.top,
      touchItems.left,
    );
    setTimeout(() => {
      setIsDraging(true);
    }, 100);
  };

  return (
    <>
      <div
        className={`drag_screen is_espresso es_func_device_img_wrapper ${
          isDragActive ? 'dragActive' : ''
        }`}
        onTouchEnd={touchEnd}
        onTouchMove={touchMove}
        style={{
          left: `${item.left}px`,
          top: `${item.top}px`,
          color: '#fff',
          width: `${item.width}px`,
          height: `${item.height}px`,
        }}
        onMouseDown={dragMouseDown}
        onTouchStart={touchStart}
        ref={drageDiv}
      >
        {item.type === 'laptop' ? (
          <Laptop item={item} isPause={isPause} />
        ) : (
          <Espresso
            item={item}
            isPause={isPause}
            setIsPause={setIsPause}
            isDraging={isDraging}
            setCloseDragElement={setCloseDragElement}
            withoutCurrentItem={displays.filter((_, i) => index !== i)}
            setRotateDislay={setRotateDislay}
          />
        )}
      </div>
    </>
  );
};

export default DragScreen;
