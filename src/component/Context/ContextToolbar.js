import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import { baseImagePath } from '../../utils/utility';
import ToolbarIcon from './ToolbarIcon';

const ContextToolbar = ({ theme }) => {
  const appsList = useStore(state => state.contextAppsList);
  //const webpagesList = useStore(state => state.webpagesList);
  const setToolbarAppCount = useStore(state => state.setToolbarAppCount);
  const selectedContextAppId = useStore(state => state.selectedContextAppId)

  useEffect(() => {
    if (selectedContextAppId) {

    }
  }, [selectedContextAppId])

  const availableApps = [
    {
      name: 'Global',
      id: 'globalShortcuts',
      icon: baseImagePath('icons/default.svg'),
    },
    ...appsList.filter(app => app.checked === 'true'),
    //...webpagesList.filter(page => page.checked === 'true'),
  ];

  setToolbarAppCount(availableApps.length);

  return (
    <div
      className="toolbar-container"
      style={{
        justifyContent: availableApps.length > 16 ? 'flex-start' : 'center',
        paddingLeft: availableApps.length > 16 ? '0px' : '1rem',
      }}
    >
      {availableApps.map((item, i) => {
        return (
          <ToolbarIcon
            key={`${item.name}-${i}`}
            id={item.id || ''}
            name={item.name}
            icon={item.icon}
            urls={item.urls || []}
          />
        );
      })}
    </div>
  );
};

export default ContextToolbar;
