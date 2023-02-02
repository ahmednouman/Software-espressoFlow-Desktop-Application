import React, { useState } from 'react';
import useStore from '../../../store';
import AppItem from './AppItem';

const AppList = () => {
  const appsList = useStore(state => state.appsList);
  const updateSavedApps = useStore(state => state.updateSavedApps);
  const [searchValue, setSearchValue] = useState('');
  //const workspaceOnboardingRun = useStore(state => state.workspaceOnboardingRun)
  const setStepIndex = useStore(state => state.setWorkspaceOnboardingStep)
  const toggleAppPopupWindow = useStore(state => state.toggleAppPopupWindow);
  const setModal = useStore(state => state.setWorkspaceOnboardingModal)

  const handleChecked = e => {
    e.stopPropagation();
    // if (workspaceOnboardingRun && e.target.checked) {
    //   updateSavedApps(e.target.name, e.target.checked ? 'true' : 'false');
    //   setStepIndex(9)
    //   toggleAppPopupWindow(false)
    //   setModal({ step: 9, visible: true })
    //   return
    // }
    updateSavedApps(e.target.name, e.target.checked ? 'true' : 'false');
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
          })}
      </ul>
    </>
  );
};

export default AppList;
