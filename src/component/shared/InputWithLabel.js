import React from 'react';

const InputWithLabel = ({
  name,
  index,
  label = '',
  type = 'text',
  placeholder = '',
  handleChange = e => {
    e.stopPropagation();
  },
  handleBlur,
  value,
  style = {},
}) => {
  return (
    <label className="input-with-label">
      {label !== '' && { label }}

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        onChange={e => {
          if (index) {
            handleChange(e, index);
          } else {
            handleChange(e);
          }
        }}
        style={{ ...style }}
        value={value}
        onBlur={handleBlur}
      />
    </label>
  );
};

export default InputWithLabel;
