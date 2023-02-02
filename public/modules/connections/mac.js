const { ipcMain, systemPreferences } = require('electron');

const postNotification = (event, data) => {
  systemPreferences.postNotification(event, data, true);
};

const initConnections = (flowlib, mainWindow, trayWindow) => {
  const deviceListener = flowlib.deviceListener(mainWindow, trayWindow);
  ipcMain.on('checkPermissions', (event, arg) => {
    console.log('checkPermissions');
    flowlib.checkPermissions();
  });

  ipcMain.on('requestPermissions', (event, arg) => {
    flowlib.requestPermissions();
  });

  ipcMain.on('startFlowHelper', (event, arg) => {
    if (process.platform === 'darwin') {
      flowlib.startFlowHelper();
    }
  });

  ipcMain.on('quitFlowHelper', (event, arg) => {
    if (process.platform === 'darwin') {
      flowlib.quitFlowHelper();
    }
  });

  ipcMain.on('setBrightnessSync', async (event, arg) => {
    if (process.platform === 'darwin') {
      try {
        const { value } = arg;
        deviceListener.brightnessSync(value);
        // mainWindow.webContents.send('sync', {
        //   setting: 'brightnessSync',
        //   id: null,
        //   value
        // });
      } catch (error) {
        console.log(error);
      }
    }
  });

  ipcMain.on('touchEnabled', async (event, arg) => {
    const { value } = arg;
    systemPreferences.postNotification(
      'com.espresso.flow.helper.toggle',
      {
        touchEnabled: value,
      },
      true,
    );

  });



  if (process.platform === 'darwin') {
    systemPreferences.subscribeNotification(
      'com.espresso.flow.helper.exitStatus',
      (event, userInfo) => {
        //console.log(userInfo);
        const { ExitStatus } = userInfo;
        //console.log('permission status', ExitStatus);
        try {
          mainWindow.webContents.send('permission', ExitStatus);
        } catch (e) { }
      },
    );

    systemPreferences.subscribeNotification(
      'com.espresso.flow.helper.executionSuccess',
      (event, userInfo) => {
        console.log('event', event, userInfo);
      },
    );
  }
};

module.exports = { initConnections, postNotification };
