import React, { useRef, useState } from 'react';
import useStore from '../../store';
import DropIcon from './DropIcon';

const Menu = () => {
  const [currentIndex, setIndex] = useState(null);
  const selectedContextShortcuts = useStore(
    state => state.selectedContextShortcuts,
  );
  const wheelRef = useRef();
  const contextLabelRef = useRef();
  const [disable, setDisable] = useState(false)

  if (window.electron) {
    window.electron.resetContext(() => {
      if (wheelRef.current) {
        wheelRef.current.removeAttribute('data-chosen');
      }
    });

    window.electron.resetFade(() => {
      const arcs = document.querySelectorAll('.arc');
      for (var i = 0; i < arcs.length; i++) {
        arcs[i].classList.remove('fadeOut');
      }

      if (contextLabelRef.current) {
        contextLabelRef.current.classList.remove('fadeOut');
      }
    });
  }
  const editShortcut = useStore(state => state.editShortcut);

  const highlight = e => {
    const index = e.target.getAttribute('data-index');
    wheelRef.current.setAttribute('data-chosen', index);
    setIndex(index);

  };

  const removeHighlight = (e) => {
    wheelRef.current.removeAttribute('data-chosen');
    setIndex(null);
  };

  const handleMove = (e) => {

    if (e.clientX < 30) {
      setDisable(true)
    } else {
      setDisable(false)
    }
  }

  const handleClick = e => {
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
    <div className="wheel-container">
      {currentIndex !== null && selectedContextShortcuts[currentIndex - 1] && (
        <div ref={contextLabelRef} className="context-label-2">
          {selectedContextShortcuts[currentIndex - 1].shortcut.displayString}
        </div>
      )}
      <div
        ref={wheelRef}
        className="wheel-config-2 on"
        onClick={e => e.stopPropagation()}
        style={{ zIndex: editShortcut ? -1 : 1 }}
        onMouseMove={e => handleMove(e)}
      >
        {selectedContextShortcuts.length > 0 &&
          selectedContextShortcuts.map((item, index) => {
            return (
              <div
                key={`shortcut-${index}`}
                data-index={index + 1}
                className="arc"
                style={{
                  pointerEvents: disable && 'none'
                }}
                onMouseEnter={highlight}
                onMouseLeave={removeHighlight}
                onClick={handleClick}
              >
                <button>
                  <DropIcon data={item} slotIndex={index} />
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Menu;
