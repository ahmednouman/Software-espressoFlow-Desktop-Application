import React, { useState } from 'react';
import { baseImagePath } from '../../../utils/utility';
import Checkbox from '../../shared/Checkbox';

const WebPageItem = ({
  id,
  index,
  name,
  icon,
  checked,
  handleChecked,
  handleToggle,
  handleRemove,
}) => {
  const [editOptionsVisible, setEditOptionsVisible] = useState(false);

  return (
    <li className="webpage-list-item">
      <div className="left-container">
        <Checkbox
          checked={checked}
          name={name}
          onChange={e => handleChecked(e, id)}
        />
        <img src={icon.search("tabGroup") > -1 ? baseImagePath('icons/tabGroup.svg') : icon} alt={name} />
        <span>{name}</span>
      </div>
      <button className="webpage-edit-btn">
        <img
          onClick={() => setEditOptionsVisible(!editOptionsVisible)}
          src={baseImagePath('icons/dots-light.svg')}
          alt="options"
        />
      </button>
      {editOptionsVisible && (
        <>
          <div
            className="fixed-modal"
            onClick={() => setEditOptionsVisible(!editOptionsVisible)}
          ></div>
          <div className="edit-options">
            <button
              onClick={() => {
                setEditOptionsVisible(!editOptionsVisible);
                handleToggle(index);
              }}
            >
              <img src={baseImagePath('icons/pen_icon.svg')} alt="edit" data-tip="Edit" />
              Edit
            </button>
            <button onClick={() => handleRemove(id)}>
              <img src={baseImagePath('icons/bin.svg')} alt="edit" />
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
};

export default WebPageItem;
