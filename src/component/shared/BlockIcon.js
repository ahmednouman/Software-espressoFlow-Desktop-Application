import React from 'react';
import { baseImagePath } from '../../utils/utility';

const BlockIcon = ({
  url,
  text,
  activeUrl,
  isActive,
  setIsActive,
  keyName,
  tooltip,
  disabled,
}) => {
  return (
    <span
      className={`es_osd_block cursor-pointer ${
        isActive ? 'es_ots_block_active' : ''
      } ${!disabled ? 'es_device_box_opacity_img' : ''}`}
      onClick={() => setIsActive(!isActive, keyName)}
    >
      <img src={baseImagePath(url)} alt={text} className="ots_unactive_img" />
      <img
        src={baseImagePath(activeUrl)}
        alt={text}
        className="ots_active_img"
      />
      <em>{tooltip}</em>
    </span>
  );
};

export default BlockIcon;
