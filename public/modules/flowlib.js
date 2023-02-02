const { app, ipcMain } = require('electron');
const { trackEvent, getCurrentTimeStamp } = require('./analytics');
const os = require('os');
const { initConnections } = require('./connections/mac');
const { initContextIPC } = require('./context/ipc');

let os_version = os.version(),
  os_type = os.type(),
  os_release = os.release(),
  os_platform = os.platform(),
  app_version = app.getVersion();

const initLib = (
  store,
  mainWindow,
  trayWindow,
  contextWindow,
  appPopupWindow,
) => {

  try{
    let flowlib = null;
    if (process.platform === 'darwin') {
      const { flowmac } = require('./flowlibmac');
      const { initWorkspaceIPC } = require('./workspace/ipc');
      flowlib = flowmac();
      initConnections(flowlib, mainWindow, trayWindow);
      initWorkspaceIPC(flowlib, mainWindow);
      initContextIPC(mainWindow, contextWindow);
    } else {
      const { flowwin } = require('./flowlibwin.js');
      const { initWorkspaceIPCWin } = require('./workspace/win_ipc');
      flowlib = flowwin();
      initWorkspaceIPCWin(flowlib, mainWindow);
    }

    if (process.platform === 'darwin') {
      store.set('firmwareVersion', '1'); // Update firmware version number here if firmware is upreved.
      let firmware_version = store.get('firmwareVersion');
      let firmware_check = store.get('firmwareUpdated') || {
        version: '0',
        completed: false,
      };
      if (firmware_version !== firmware_check.version) {
        store.set('firmwareUpdated', {
          version: firmware_check.version,
          completed: false,
        });
      }
    }

    let startDeviceListener = () => {};
    let stopDeviceListener = () => {};
    let deviceListener = null;

    const syncSettings = async (window, setting, id, value) => {
      try {
        mainWindow.webContents.send('sync', { setting, id, value });
      } catch (error) {
        console.log(error);
      }
    };

    mainWindow.webContents.on('dom-ready', () => {
      if (!flowlib) return;
      let tutorial_check = store.get('releaseTutorial') || {
        version: '',
        completed: false,
      };

      try {
        if (process.platform === 'darwin') {
          let workspaceFlag = store.get('workspaceEnabled');
          if(workspaceFlag !== true || workspaceFlag !== false) {
            store.set('workspaceEnabled', true);
          }

          if (store.get('workspaceEnabled')) {
            flowlib.startFlowWindow();
          } else {
            flowlib.quitFlowWindow();
          }
        }
      } catch {}

      const displays = flowlib.getDisplaysInfo();
      if (deviceListener) return;
      deviceListener = flowlib.deviceListener(mainWindow, trayWindow);
      trackEvent('App-launch', {
        APP_version: app_version,
        OS_version: os_version,
        OS_type: os_type,
        OS_release: os_release,
        OS_platform: os_platform,
        Stamp: getCurrentTimeStamp(),
      });
      startDeviceListener = deviceListener.rotation_update;
      stopDeviceListener = deviceListener.stop_rotation_listeners;
      mainWindow.webContents.send('displays', displays);
      mainWindow.webContents.send('getTutorial', tutorial_check);
    });

    ipcMain.on('getDisplays', async (event, arg) => {
      const displays = flowlib.getDisplaysInfo();
      mainWindow.webContents.send('displays', displays);
    });

    ipcMain.on('setWorkspaceEnabled', async (event, arg) => {
      if (arg === undefined) return;
      store.set('workspaceEnabled', arg.value);

      try {
        if (arg.value === true) {
          await flowlib.startFlowWindow();
        } else {
          await flowlib.quitFlowWindow();
        }
      } catch {}
    });

    ipcMain.on('startFirmwareUpdateTool', async (event, arg) => {
      flowlib.startFirmwareUpdateTool();
    });

    ipcMain.handle('getFirmwareUpdated', async (event, arg) => {
      const firmwareUpdatedResult = store.get('firmwareUpdated');
      return firmwareUpdatedResult.completed;
    });

    ipcMain.on('setFirmwareUpdated', async (event, arg) => {
      store.set('firmwareUpdated', { version: store.get('firmwareVersion'), completed: arg });
    });

    ipcMain.on('reinitialise', async (event, arg) => {
      if (deviceListener) {
        deviceListener.reinitialise_displays();
      }
    });

    ipcMain.on('setBrightness', (event, arg) => {
      const { window, id, value } = arg;
      flowlib.setBrightness(id, value);
      syncSettings(window, 'brightness', id, value);
    });

    ipcMain.on('setContrast', (event, arg) => {
      const { id, value } = arg;
      flowlib.setContrast(id, value);
    });

    ipcMain.on('setVolume', (event, arg) => {
      const { id, value } = arg;
      flowlib.setVolume(id, value);
    });

    ipcMain.on('setColourPreset', (event, arg) => {
      const { id, value } = arg;
      flowlib.setColourPreset(id, value);
    });

    ipcMain.on('setLockedRotation', (event, arg) => {
      const { window, id, value } = arg;
      flowlib.setLockedRotation(id, value);
      syncSettings(window, 'is_locked', id, value);
    });

    ipcMain.on('setRotate', (event, arg) => {
      const { window, id, value } = arg;
      flowlib.setRotate(id, value);
      syncSettings(window, 'orientation', id, value);
      setTimeout(() => {
        const displays = flowlib.getDisplaysInfo();
        mainWindow.webContents.send('displays', displays);
      }, 500);
    });

    ipcMain.on('setMirrorMode', (event, arg) => {
      const { id, value } = arg;
      flowlib.setMirrorMode(id, value);
    });

    ipcMain.on('setLocation', (event, arg) => {
      const { values } = arg;
      flowlib.setLocation(values);
      setTimeout(() => {
        const displays = flowlib.getDisplaysInfo();
        mainWindow.webContents.send('displays', displays);
      }, 500);
    });

    ipcMain.on('getLocation', (event, arg) => {
      const { id } = arg;
      const location = flowlib.getLocation(id);
      mainWindow.webContents.send('location', { id, location });
    });

    ipcMain.on('setTutorialDone', (event, arg) => {
      store.set('releaseTutorial', {
        version: app.getVersion(),
        completed: arg,
      });
    });

    ipcMain.on('getDdcValues', (event, arg) => {
      const { id, type } = arg;

      if (!type.includes('non')) {
        let settings = {};
        const brightness = flowlib.getDdcValue('brightness', id);
        const contrast = flowlib.getDdcValue('contrast', id);
        const colour_preset = flowlib.getDdcValue('colorpreset', id);

        settings = {
          brightness,
          contrast,
          colour_preset,
        };

        if (type === 'espresso v2') {
          let volume = flowlib.getDdcValue('volume', id);
          settings = { ...settings, volume };
        }
      }
    });

    ipcMain.on('getDisplaysTray', (event, arg) => {
      const displays = flowlib.getDisplaysTray();
      trayWindow.webContents.send('displays', displays);
    });

    ipcMain.on('captureEvent', (event, arg) => {
      trackEvent(arg['action'], { action: arg['label'], Stamp: getCurrentTimeStamp() } );
    });

    ipcMain.on('toggle-app-popup', (event, arg) => {
      const { visible } = arg;
      if (visible) {
        appPopupWindow.show();
      } else {
        appPopupWindow.close();
      }
    });

    ipcMain.handle('getOnboarding', (event, arg) => {
      const onboarding = store.get('onboarding');
      return (
        onboarding || {
          initial: false,
          display: false,
          workspace: false,
          pen: false,
        }
      );
    });

    ipcMain.on('setOnboarding', (event, arg) => {
      store.set('onboarding', arg);
    });

    return {
      startDeviceListener,
      stopDeviceListener,
      quitFlowHelper: flowlib.quitFlowHelper,
      quitFlowWindow: flowlib.quitFlowWindow,
      quitApps: flowlib.quitApps,
    };
  }catch(error){
    trackEvent('Catch-Error', { Source: "flowlib" , Stamp: getCurrentTimeStamp() });
  }
};

module.exports = {
  initLib,
};
