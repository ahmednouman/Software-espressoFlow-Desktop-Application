import React, { useState, useRef, useEffect } from 'react';
import useStore from '../../store';
import { baseImagePath } from '../../utils/utility';

const containerStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
  padding: 0,
  margin: 0,
  backgroundColor: 'transparent',
};



const Context = () => {
  const selectedContextShortcuts = useStore(
    state => state.selectedContextShortcuts,
  );
  const onPenShortcuts = useStore(state => state.onPenShortcuts)
  const [currentIndex, setIndex] = useState(null);
  const wheelRef = useRef();
  const contextLabelRef = useRef();

  let currentTime = new Date().getTime()

  useEffect(() => {
    const unsubscribePenShortcuts = onPenShortcuts()

    return () => {
      unsubscribePenShortcuts()
    }
  }, [])

  if (window.electron) {
    window.electron.resetContext(() => {
      if (wheelRef.current) {
        wheelRef.current.removeAttribute('data-chosen');
      }
    });
  }

  const highlight = e => {
    const index = e.target.getAttribute('data-index');
    wheelRef.current.setAttribute('data-chosen', index);
    setIndex(index);
  };

  const removeHighlight = () => {
    wheelRef.current.removeAttribute('data-chosen');
    setIndex(null);
  };

  const triggerShortcut = (item) => {
    if (window.electron) {
      window.electron.triggerShortcut(item);
    }
  };

  const closeContext = () => {
    if (window.electron) {
      window.electron.closeContext();
    }
  };

  const pointIsInMenu = (x, y) => {
    const parentDiv = wheelRef.current.parentNode;
    const parentWidth = parentDiv.clientWidth;
    const parentHeight = parentDiv.clientHeight;
    const circleEq =
      Math.pow(x - parentWidth / 2, 2) + Math.pow(y - parentHeight / 2, 2);

    if (circleEq <= Math.pow(180, 2) && circleEq >= Math.pow(100, 2)) {
      return true;
    }
    return false;
  };

  const handleClick = (e, shortcut) => {
    try {
      const x = e.clientX;
      const y = e.clientY;

      const pointIn = pointIsInMenu(x, y);
      if (pointIn) {
        let clickTime = new Date().getTime()

        if (clickTime - currentTime > 1000) {
          if (shortcut.keyCode === "" && shortcut.modifierFlag.length === 0) return
          toggleHighlight(e)
          triggerShortcut(shortcut);
        }

        currentTime = new Date().getTime()
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleContainerClick = e => {
    e.stopPropagation()
    const x = e.clientX
    const y = e.clientY

    const parentDiv = wheelRef.current.parentNode;
    const parentWidth = parentDiv.clientWidth;
    const parentHeight = parentDiv.clientHeight;
    const circleEq =
      Math.pow(x - parentWidth / 2, 2) + Math.pow(y - parentHeight / 2, 2);

    if (circleEq >= Math.pow(190, 2)) {
      closeContext()
    }
  }

  const toggleHighlight = (e) => {
    let dataIndex = null
    const target = e.target
    if (target.getAttribute('data-index')) {
      dataIndex = target.getAttribute('data-index')
    } else if (target.classList.contains('drop-shortcut-layout')) {
      const nodeList = target.childNodes
      if (nodeList.length > 0) {
        dataIndex = nodeList[0].getAttribute("data-index")
      }
    } else {
      const parent = target.parentNode
      dataIndex = parent.getAttribute("data-index")
    }

    if (!dataIndex) return

    const arcs = document.querySelectorAll(".arc")
    arcs[dataIndex].setAttribute('data-chosen', dataIndex)

    setTimeout(() => {
      arcs[dataIndex].removeAttribute('data-chosen')
    }, 200)
  }

  return (
    <div className="" style={{ ...containerStyle }}
      onClick={closeContext}>
      {currentIndex !== null && selectedContextShortcuts[currentIndex - 1] && (
        <div ref={contextLabelRef} className="context-label">
          {selectedContextShortcuts[currentIndex - 1].name}
        </div>
      )}

      <div
        ref={wheelRef}
        className="wheel on"
        onClick={handleContainerClick}
        onTouchStart={e => {
          console.log('touch start')
        }}
        onTouchEnd={e => {
          console.log('touch end')
        }}

        onTouchMove={e => {
          console.log('touch move')
        }}
      >
        {selectedContextShortcuts.map((item, index) => {
          return (
            <div
              key={`${item.name}-${index}`}
              data-index={index + 1}
              className="arc"

              onMouseOver={e => highlight(e)}
              onMouseOut={() => removeHighlight()}

              onTouchEnd={e => {
                const x = e.clientX;
                const y = e.clientY;
                if (pointIsInMenu(x, y)) {
                  const clickTime = new Date().getTime()
                  if (clickTime - currentTime > 1000) {
                    // add class
                    e.target.click();

                    // remove class
                  }

                }
              }}
              onClick={(e) => handleClick(e, { ...item.shortcut, name: item.name })}
            >

              <button data-index={index + 1} onMouseOver={e => highlight(e)}
                onMouseOut={() => removeHighlight()}>
                {item.icon?.icon ? <img
                  className="context-icon"
                  data-index={index + 1}
                  src={baseImagePath(item.icon.icon)}
                  alt={item.name}
                  width="30px"
                  height="30px"
                /> :
                  <span className="context-menu-text">{item.name}</span>}

              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Context;
