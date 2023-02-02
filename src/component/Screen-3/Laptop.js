/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import useStore from '../../store';
import { baseImagePath } from '../../utils/utility';

const setDisplayStateSelector = state => state.setDisplayState;
const displaysSelector = state => state.displays;

const Laptop = ({ item, isPause }) => {
  const theme = useStore(state => state.theme);
  const setDisplayState = useStore(setDisplayStateSelector);
  const displays = useStore(displaysSelector);


  useEffect(() => {
    if (displays.length > 0) {
      setDisplayState();
    }


  }, [displays.length, setDisplayState]);

  return (
    <div
      className={`es_device_box es_device_box_opacity unselectable ${isPause && 'es_device_box_opacity_img'
        }`}
      style={{ height: '100%' }}
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
    </div>
  );
};

export default Laptop;
