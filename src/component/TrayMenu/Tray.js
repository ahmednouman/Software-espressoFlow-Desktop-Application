import { useRef, useEffect } from 'react';
import useStore from '../../store';
import TrayHeader from './Header';
import Monitors from './Monitors';
import SyncSettings from './SyncSettings';

const containerStyles = {
  width: '100%',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  padding: '1em',
  maxWidth: '400px',
};

const updateDisplayByRotationSelector = state =>
  state.updateDisplayFromRotation;

const TrayMenuApp = () => {
  const dockContainer = useRef(null);
  const theme = useStore(state => state.theme);
  const setTheme = useStore(state => state.setTheme);
  const updateSettingValue = useStore(state => state.updateSettingValue);
  const updateDisplayByRotation = useStore(updateDisplayByRotationSelector);

  if (window && window.electron) {
    window.electron.getTheme(theme => {
      setTheme(theme);
    });

    window.electron.sync(arg => {
      updateSettingValue(arg);
    });

    window.electron.rotationChanged(arg => {
      updateDisplayByRotation(arg);
    });

    window.electron.refreshTray();
  }

  useEffect(() => {
    if (dockContainer && dockContainer.current) {
      var offsets = dockContainer.current.getBoundingClientRect();
      const topOffset = offsets.top;
      window.electron.setTrayHeight(topOffset);
    }
  }, []);

  return (
    <div
      style={{
        backgroundColor: theme === 'light' ? '#F0F0F0' : '#5A5A5A',
        ...containerStyles,
      }}
      className="unselectable"
    >
      <TrayHeader />
      <Monitors />
      <div
        ref={dockContainer}
        style={{ display: 'flex', alignSelf: 'flex-start', height: 'auto' }}
      ></div>

      <SyncSettings theme={theme} />
    </div>
  );
};

export default TrayMenuApp;
