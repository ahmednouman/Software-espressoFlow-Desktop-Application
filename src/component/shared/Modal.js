import React from 'react';
import { baseImagePath } from '../../utils/utility';

const Modal = ({ children, title = '', onClose }) => {
  return (
    <>
      <div className="fixed-modal-background" onClick={onClose}></div>
      <div className="container-modal">
        <div className="container-modal-header">
          <h4>{title}</h4>
        </div>
        {children}
      </div>
    </>
  );
};

export default Modal;
