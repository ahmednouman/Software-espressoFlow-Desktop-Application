import React, { useEffect } from 'react';
import useStore from '../../store';
import Shortcuts from './Shortcuts';
import Menu from './Menu';
import AppPopup from './AppPopup/Index';
import AppToolbar from '../Window-Management/AppToolbar/Index';
import { baseImagePath } from '../../utils/utility';

const Config = () => {
  const selectedContextAppId = useStore(state => state.selectedContextAppId)
  const setAppContextShortcuts = useStore(state => state.setAppContextShortcuts)
  const workspaceAppPopupVisible = useStore(
    state => state.workspaceAppPopupVisible,
  );

  useEffect(() => {
    if (selectedContextAppId === "") {
      setAppContextShortcuts("Global")
    }
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <Menu />
      <img
        className="context-arrow unselectable"
        src={baseImagePath('icons/arrow.svg')}
        alt="arrow"
      />
      <Shortcuts />
      <AppToolbar groupName="context" />
      {workspaceAppPopupVisible && <AppPopup />}
    </div>
  );
};

export default Config;
