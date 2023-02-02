import React from 'react';

const Input = ({ name, value, onChange, type, placeholder, ...props }) => {
  return (
    <input
      className="input-field"
      {...props}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

export default Input;
