import React from 'react';
import { baseImagePath } from '../../utils/utility';
import useStore from '../../store/index';

export default function RotateDisplay({ display }) {
  const theme = useStore(state => state.theme);
  const setRotateAPI = useStore(state => state.setRotate);
  const setRotateScreen = async val => {
    await setRotateAPI('tray', display.id, val === 270 ? 0 : val + 90);
  };

  return (
    <img
      width={40}
      height={40}
      src={baseImagePath(
        theme === 'light'
          ? `icons/panel-display.svg`
          : 'icons/panel-display-dark.svg',
      )}
      alt="monitor icon"
      className=""
      style={{
        transform: `rotate(${display.orientation}deg)`,
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
      }}
      onClick={() => setRotateScreen(display.orientation)}
    />
  );
}
