import React from 'react';
import { baseImagePath } from '../../utils/utility';

const ModalTitle = ({ children, title = '', onClose }) => {
  return (
    <>
      <div className="fixed-modal-background"></div>
      <div className="modal-title-container">
        <div className="container-modal-notify-header" style={{color: '#FFFFFF'}}>{title}</div>
        {children}
      </div>
    </>
  );
};

export default ModalTitle;
