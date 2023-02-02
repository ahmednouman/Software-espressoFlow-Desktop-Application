import React, { useRef, useState, useEffect } from 'react';
import useStore from '../../../../store';
import { baseImagePath, TextTruncate } from '../../../../utils/utility';

const Icon = ({ item, i, slotIndex, icon, className, rotation, displayId }) => {
  const removeAppFromWorkspace = useStore(
    state => state.removeAppFromWorkspace,
  );
  const iconRef = useRef(null);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    if (item.name === '') {
      setToggle(false);
    }
  }, []);

  useEffect(() => {
    if (!iconRef.current) return;
    const transform = iconRef.current.style.transform;
    if (rotation !== 0 && transform === '') {
      iconRef.current.style.transform = `rotate(${-rotation}deg)`;
    }
  }, [iconRef, toggle]);

  const handleRemove = e => {
    e.stopPropagation();
    removeAppFromWorkspace(displayId, item.name, slotIndex);
  };

  const handleClick = e => {
    if (e.target.className === 'app-icon-remove-drag') {
      e.stopPropagation();
    }
  };

  return (
    <div
      key={`${item.name}-${i}`}
      data-id={item.name}
      data-name={item.name}
      data-index={slotIndex}
      className={item.name !== '' ? 'app-icon-container' : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        transform:
          rotation === 90
            ? 'rotate(-90deg)'
            : rotation === 180
              ? 'rotate(-180deg)'
              : rotation === 270
                ? 'rotate(-270deg)'
                : 'rotate(0deg)',
      }}
      ref={iconRef}
      onClick={handleClick}
      onMouseOver={() => {
        setToggle(true);
      }}
      onMouseOut={() => {
        setToggle(false);
      }}
    >
      <img className={className} src={icon.search("tabGroup") > -1 ? baseImagePath("icons/tabGroup.svg") : icon} alt={item.name} />

      {item.name !== '' && (
        <img
          style={{
            visibility: toggle ? 'visible' : 'hidden',
          }}
          className="app-icon-remove-drag"
          alt="remove app"
          src={baseImagePath('icons/remove.svg')}
          onClick={handleRemove}
        />
      )}

      {toggle && item.name !== '' && (
        <div
          style={{
            position: 'absolute',
            top:
              item.urls && item.urls.length > 1
                ? '-50px'
                : item.urls && item.urls.length > 2
                  ? '-60px'
                  : '-35px',
            color: 'black',
            width: '100px',
            minHeight: '25px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99,
            fontSize: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
          }}
          className="app-icon-detail"
        >
          {TextTruncate(item.name, 12)}
        </div>
      )}
    </div>
  );
};

export default Icon;
