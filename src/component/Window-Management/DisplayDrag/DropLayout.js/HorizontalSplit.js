import React from 'react';
import SingleList from './SingleList';

const HorizontalSplit = ({ data }) => {
  const { apps, appsList, ...rest } = data;
  let actions = ['topHalf', 'bottomHalf'];

  return (
    <div
      className={`${
        data.displayType === 'laptop'
          ? 'arrangement-layout-screen-laptop'
          : 'arrangement-layout-screen'
      } grid grid-row-2 gap-2`}
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

export default HorizontalSplit;
