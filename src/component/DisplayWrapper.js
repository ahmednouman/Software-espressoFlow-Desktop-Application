import React, { useEffect } from 'react';
import useStore from '../store';
import { ToastProvider } from 'react-toast-notifications';
import Tooltip from './shared/Tooltip';
import SidebarOnboarding from './shared/Onboarding/Sidebar';
import DisplayOnboarding from './shared/Onboarding/Display';

const setDisplaysSelector = state => state.setDisplays;
const updateDisplayByRotationSelector = state =>
  state.updateDisplayFromRotation;
const updateSettingSelector = state => state.updateSettingValue;
const updateSingleDisplaySelector = state => state.updateSingleDisplay;
//const setBrightnessSyncSelector = state => state.setBrightnessSync;

const Wrapper = ({ children }) => {
  const setTheme = useStore(state => state.setTheme);
  const setDisplays = useStore(setDisplaysSelector);
  const updateDisplayByRotation = useStore(updateDisplayByRotationSelector);
  const updateSettings = useStore(updateSettingSelector);
  const updateSingleDisplay = useStore(updateSingleDisplaySelector);
  const getOnboarding = useStore(state => state.getOnboarding);

  useEffect(() => {
    if (window && window.electron) {
      getOnboarding();
      window.electron.displays(displays => {
        setDisplays(displays);
      });

      window.electron.getTheme(theme => {
        setTheme(theme);
      });

      window.electron.requestTheme();
      window.electron.rotationChanged(updateDisplayByRotation);
      window.electron.getLocation(({ id, location }) => {
        updateSettings({
          setting: 'location',
          id,
          value: location,
        });
      });

      window.electron.ddcValues(({ id, settings }) => {
        updateSingleDisplay(id, settings);
      });
    }
  }, []);

  return (
    <ToastProvider onKeyDown={event => test(event)}>
      <Tooltip />
      <SidebarOnboarding />
      <DisplayOnboarding />
      <div>{children}</div>
    </ToastProvider>
  );
};

export default Wrapper;
