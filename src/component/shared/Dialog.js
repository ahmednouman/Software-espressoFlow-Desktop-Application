import React from 'react';

const Dialog = ({ children, message }) => {
  return (
    <>
      <div className="dialog-bg"></div>
      <div className="dialog">
        <p className="message">{message}</p>
        {children}
      </div>
    </>
  );
};

export default Dialog;
