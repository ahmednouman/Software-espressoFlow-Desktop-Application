import React, { useState } from 'react';
import useStore from '../../../store';
import AppItem from './AppItem';

const AppList = () => {
  const appsList = useStore(state => state.contextAppsList);
  const updateContextApps = useStore(state => state.updateContextApps);
  const [searchValue, setSearchValue] = useState('');

  const handleChecked = e => {
    e.stopPropagation();
    updateContextApps(e.target.name, e.target.checked ? 'true' : 'false');
  };

  const handleSearch = e => {
    e.stopPropagation();
    setSearchValue(e.target.value.toLowerCase());
  };

  return (
    <>
      <input
        className="search-input"
        type="search"
        onChange={handleSearch}
        value={searchValue}
        placeholder="Search your apps"
      />
      <ul className="app-list">
        {appsList.length > 0 &&
          appsList.map(app => {
            if (app.name && typeof app.name === 'string') {
              const appName = app.name.toLowerCase();
              if (appName.includes(searchValue)) {
                return (
                  <AppItem
                    key={app.name}
                    name={app.name}
                    icon={app.icon}
                    checked={app.checked === 'true'}
                    handleChecked={handleChecked}
                  />
                );
              }
            }
          })}
      </ul>
    </>
  );
};

export default AppList;
