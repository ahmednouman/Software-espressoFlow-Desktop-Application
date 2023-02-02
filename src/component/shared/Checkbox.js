import React from 'react';

const Checkbox = ({ name, checked, onChange }) => {
  return (
    <input
      className="checkbox"
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
    />
  );
};

export default Checkbox;
