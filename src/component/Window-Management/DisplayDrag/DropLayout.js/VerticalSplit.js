import React from 'react';
import SingleList from './SingleList';

const VerticalSplit = ({ data }) => {
  const { apps, appsList, ...rest } = data;
  let actions = ['leftHalf', 'rightHalf'];

  return (
    <div
      className={`${
        data.displayType === 'laptop'
          ? 'arrangement-layout-screen-laptop'
          : 'arrangement-layout-screen'
      } grid grid-col-2 gap-2`}
    >
      {apps.map((app, i) => {
        let updatedData = { ...rest, apps: [app], action: actions[i] };
        return (
          <SingleList
            key={`${data.displayId}-${data.arrangement}-${i}`}
            data={updatedData}
            slotIndex={i}
          />
        );
      })}
    </div>
  );
};

export default VerticalSplit;
