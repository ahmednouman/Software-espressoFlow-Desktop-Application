import React from 'react';
import useStore from '../../../store';
import { baseImagePath } from '../../../utils/utility';
import NavTabs from '../../shared/Tabs';
import AppList from './AppList';
import WebPage from './WebPage';

const Index = () => {
  const toggleAppPopupWindow = useStore(state => state.toggleAppPopupWindow);

  const onboarding = useStore(state => state.onboarding);
  const startWorkspaceWalkthrough = useStore(
    state => state.startWorkspaceWalkthrough,
  );

  const tabState = useStore(state => state.windowTabState);
  const workspaceState = useStore(state => state.workspaceState);

  // console.log(onboarding, startWorkspaceWalkthrough);


  return (
    <>
      <div className="modal" onClick={() => toggleAppPopupWindow(false)}></div>
      <div className="app-popup onboarding-workspace-step8">
        <div className="menu-toolbar">
          <p>Select your favourite apps</p>
          <img
            onClick={() => !startWorkspaceWalkthrough ? toggleAppPopupWindow(false) : toggleAppPopupWindow(true)}
            src={baseImagePath('icons/close.svg')}
            alt="close"
          />
        </div>
        <NavTabs
          navTitles={['Apps', 'Web pages']}
          tabContent={[<AppList />, <WebPage />]}
        />
      </div>
    </>
  );
};

export default Index;
