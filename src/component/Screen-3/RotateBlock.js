import React from 'react';
import { baseImagePath } from '../../utils/utility';

const RotateBlock = ({
  isLocked,
  displaySetting,
  setDisplay,
  rotateBlockToggle,
  setRotateBlockToggle,
  setPictureToggle,
}) => {
  // if (isLocked && rotateBlockToggle) {
  //   setRotateBlockToggle(false);
  // }

  return (
    <div className="rotateBlock">
      <span
        className='es_dv_set_ft es_dv_rotete_btn cursor-pointer'
        onClick={() => {
          setRotateBlockToggle(!rotateBlockToggle);
          setPictureToggle(false);
        }}
      >
        <img src={baseImagePath('icons/rotate.svg')} alt="mirror-img" />
        <span>Rotate</span>
      </span>
      <div
        className="rotInnerBlock"
        style={{
          height: rotateBlockToggle ? '130px' : '0',
          padding: rotateBlockToggle ? '4px 0' : '0',
        }}
      >
        <img
          src={baseImagePath('icons/display1.svg')}
          className={displaySetting.normal ? 'active' : ''}
          alt="mirror-img"
          onClick={() =>{
            window.electron.captureEvent("Manual-Rotate", {Orientation:0})
            setDisplay('normal', 0)
          } }
        />
        <img
          src={baseImagePath('icons/display3.svg')}
          alt="mirror-img"
          className={displaySetting.right ? 'active' : ''}
          onClick={() => {
            window.electron.captureEvent("Manual-Rotate", {Orientation:90})
            setDisplay('right', 90)
          }}
        />
        <img
          src={baseImagePath('icons/display4.svg')}
          alt="mirror-img"
          className={displaySetting.inverted ? 'active' : ''}
          onClick={() => {
            window.electron.captureEvent("Manual-Rotate", {Orientation:180})
            setDisplay('inverted', 180)
          }}
        />
        <img
          src={baseImagePath('icons/display2.svg')}
          alt="mirror-img"
          className={displaySetting.left ? 'active' : ''}
          onClick={() => {
            window.electron.captureEvent("Manual-Rotate", {Orientation:270})
            setDisplay('left', 270)
          }}
        />
      </div>
    </div>
  );
};

export default RotateBlock;
