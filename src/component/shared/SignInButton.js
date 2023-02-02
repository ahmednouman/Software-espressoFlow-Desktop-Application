import React from 'react';

const SignInButton = ({ label, icon, onClick, ...props }) => {
  return (
    <button className="sign-in-button" {...props} onClick={onClick}>
      <img className="sign-in-button-icon" src={icon || ''} alt={label} />
      {label}
    </button>
  );
};

export default SignInButton;
