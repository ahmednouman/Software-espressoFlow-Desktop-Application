import React from 'react';
import { baseImagePath } from '../../utils/utility';

const ModalNotify = ({ children, title = '', onClose }) => {
  return (
    <>
      <div className="fixed-modal-background" onClick={onClose}></div>
      <div className="container-notify-modal">
        <div className="container-modal-notify-header">{title}</div>
        {children}
      </div>
    </>
  );
};

export default ModalNotify;