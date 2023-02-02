import React from 'react';
import useStore from '../../../store';
import { baseImagePath } from '../../../utils/utility';
import NavTabs from '../../shared/Tabs';
import AppList from './AppList';

const Index = () => {
  const toggleAppPopupWindow = useStore(state => state.toggleAppPopupWindow);
  console.log(toggleAppPopupWindow)
  return (
    <>
      <div className="modal" onClick={() => {
        toggleAppPopupWindow(false)
      }}></div>
      <div className="app-popup">
        <div className="menu-toolbar">
          <p>Select your favourite apps</p>
          <img
            onClick={() => toggleAppPopupWindow(false)}
            src={baseImagePath('icons/close.svg')}
            alt="close"
          />
        </div>
        <NavTabs navTitles={['Apps']} tabContent={[<AppList />]} />
      </div>
    </>
  );
};

export default Index;
