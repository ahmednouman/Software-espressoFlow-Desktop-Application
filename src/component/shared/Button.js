import React from 'react';

const Button = ({
  label,
  color = 'primary',
  type = 'button',
  handleClick,
  style = {},
}) => {
  return (
    <button
      style={{ ...style }}
      className={`${color}-btn`}
      type={type}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};

export default Button;
