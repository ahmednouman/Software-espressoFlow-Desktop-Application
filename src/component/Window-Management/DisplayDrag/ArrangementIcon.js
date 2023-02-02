import React from 'react';

const ArrangementIcon = ({ active, children, handleClick }) => {
  return (
    <div
      onClick={handleClick}
      className={`arrangement-icon-container ${
        active ? 'arrangement-icon-bg-white' : 'arrangement-icon-bg-dark'
      }`}
    >
      {children}
    </div>
  );
};

export default ArrangementIcon;
