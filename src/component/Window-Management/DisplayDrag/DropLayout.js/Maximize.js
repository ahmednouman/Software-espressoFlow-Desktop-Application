import React from 'react';
import SingleList from './SingleList';

const Maximize = ({ data }) => {
  const updatedData = {
    ...data,
    action: 'maximize',
  };
  return (
    <div
      className={`${
        data.displayType === 'laptop'
          ? 'arrangement-layout-screen-laptop'
          : 'arrangement-layout-screen'
      }`}
    >
      <SingleList data={updatedData} slotIndex={0} />
    </div>
  );
};

export default Maximize;
