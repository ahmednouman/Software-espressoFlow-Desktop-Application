import React from 'react';

const Radio = ({ label, name, value, handleChange, checked = false, style }) => {
  return (
    <label style={{ ...style }} className="radio-container">
      <span className="label">{label}</span>
      <input type="radio" name={name} value={value} onChange={handleChange} checked={checked} />
      <span className="checkmark"></span>
    </label>
  );
};

export default Radio;
