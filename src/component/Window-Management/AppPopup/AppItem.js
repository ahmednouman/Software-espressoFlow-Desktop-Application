import React from 'react';
import Checkbox from '../../shared/Checkbox';

const AppItem = ({ name, icon, checked, handleChecked }) => {
  return (
    <li className="app-list-item">
      <Checkbox checked={checked} name={name} onChange={handleChecked} />
      <img src={icon} alt={name} />
      <span>{name}</span>
    </li>
  );
};

export default AppItem;
