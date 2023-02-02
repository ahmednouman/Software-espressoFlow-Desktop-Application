import React from 'react';
import { baseImagePath } from '../../utils/utility';

const Block = ({ url, activeUrl, text, activeText, click, active, setActive }) => {

  return (
    <span
      className={`es_dv_set_ft cursor-pointer ${
        active ? 'es_eot_block_active' : ''
      }`}
      onClick={() => {
        let value = "on";
        if(active){
          value = "off"
        }
        window.electron.captureEvent("Setting-Click", {LockRotation:value})
        click(!active);
        setActive(!active);
      }}
    >
      <img
        src={baseImagePath(url)}
        alt={text}
        className="option_unactive_img"
      />
      <img
        src={baseImagePath(activeUrl)}
        alt={text}
        className="option_active_img"
      />
      <span>{active ? activeText : text}</span>
    </span>
  );
};

export default Block;
