// Module to control the application lifecycle and the native browser window.
const {
  app,
  BrowserWindow,
  protocol,
  shell,
  ipcMain,
  Tray,
  Menu,
  MenuItem,
  globalShortcut,
  dialog,
  nativeTheme,
  systemPreferences,
} = require('electron');

const { Deeplink } = require('electron-deeplink');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');
const { initLib } = require('./modules/flowlib');
const { parseQuery } = require('./modules/utils');
const jwt_decode = require('jwt-decode');
const { default: axios } = require('axios');
const server = 'https://dist.unlock.sh/v1/electron';
const productId = '71ce092e-5c54-42e5-b6a2-6be2a81c5c68';
const updateUrl = `${server}/${productId}/releases`;
const { store } = require('./modules/store');
const { trackEvent, getCurrentTimeStamp } = require('./modules/analytics');

if (!app.isPackaged) process.env.NODE_ENV = 'development';
else process.env.NODE_ENV = 'production';

autoUpdater.setFeedURL({
    url: updateUrl,
    serverType: 'json',
    provider: 'generic',
    useMultipleRangeRequest: false,
});

const appElements = {
  tray: null,
  mainWindow: null,
  trayWindow: null,
  trayWindowVisible: false,
  ipcToggleRunning: false,
  appPopupWindow: null,
  appPopupWindowVisible: false,
};

let quitUpdate = false;

const appFolder = path.dirname(process.execPath);
const updateExe = path.resolve(appFolder, '..', 'Update.exe');
const exeName = path.basename(process.execPath);

let trayHeight = 225,
  trayWidth = 200;

ipcMain.on('setDisplay', (e, args) => { });

ipcMain.handle('get-version', (event, data) => {
  return app.getVersion()
  //event.reply('send-version', app.getVersion());
});

ipcMain.on('signout', async (event, arg) => {
  try {
    appElements.removeDeviceListener();
    appElements.mainWindow.close();
    //appElements.tray.destroy();
    try {
      if (appElements.tray) {
        appElements.tray.destroy();
      }
    } catch (error) {
      console.log(error)
    }
    store.delete('user');
    await appElements.quitApps();
    appElements.loginWindow.show();
  } catch (e) {
    console.log(e);
    trackEvent('Catch-Error', { Source: "on_signout", Stamp: getCurrentTimeStamp() });
  }
});

ipcMain.on('setLogin', (event, arg) => {
  try {
    const user = arg.user;
    const { first_name, last_name, email } = user;
    store.set('user', {
      name: `${first_name} ${last_name}`,
      email,
    });
    appElements.loginWindow.hide();
    if (!appElements.mainWindow) {
      initialMainApp();
    } else {
      appElements.mainWindow.show();
      createTray();
    }
  } catch (e) {
    console.log(e);
    trackEvent('Catch-Error', { Source: "setLogin" , Stamp: getCurrentTimeStamp() });
  }
});

ipcMain.on('requestUser', (event, arg) => {
  const user = store.get('user');
  if (user) {
    appElements.mainWindow.send('auth', user);
  }
});

let forceQuit = false;

const isMac = process.platform === 'darwin';
const template = [
  ...(isMac
    ? [
      {
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: function () {
              forceQuit = true;
              app.quit();
            },
          },
        ],
      },
    ]
    : []),
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      ...(isMac
        ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'close' },
        ]
        : [{ role: 'close' }]),
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function launchAtStartup() {
  try{
    let currentSettings = app.getLoginItemSettings();
    if (process.platform === 'darwin' && currentSettings.openAtLogin === false) {
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
      });
    }

    if (process.platform !== 'darwin') {
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
        path: updateExe,
        args: [
          '--processStart',
          `"${exeName}"`,
          '--process-start-args',
          `"--hidden"`,
        ],
      });
    }
  }catch(err){
    trackEvent('Catch-Error', { Source: "LaunchAtStartup", Stamp: getCurrentTimeStamp()  });
  }
}

async function createLoginWindow() {
  try{
    var loginWindow = new BrowserWindow({
      width: 910,
      height: 600,
      minWidth: 900,
      minHeight: 600,
      backgroundColor: 'white',
      resizable: false,
      frame: true,
      webPreferences: {
        devTools: !app.isPackaged,
        nodeIntegration: true,
        worldSafeExecuteJavaScript: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    const appURL = app.isPackaged
      ? `file://${__dirname}/index.html?login`
      : 'http://localhost:3000/login';

    loginWindow.loadURL(appURL);

    // Automatically open Chrome's DevTools in development mode.
    if (!app.isPackaged) {
      loginWindow.webContents.openDevTools();
    }


    loginWindow.on('close', e => {
      app.exit(0);
    });

    loginWindow.hide();
    appElements.loginWindow = loginWindow;
  }catch(err){
    trackEvent('Catch-Error', { Source: "createLoginWindow" , Stamp: getCurrentTimeStamp() });
  }
}

let mainWindow;

// Create the native browser window.
async function createWindow() {
  try{
    if (!app.isPackaged) process.env.NODE_ENV = 'development';
    else process.env.NODE_ENV = 'production';

    mainWindow = new BrowserWindow({
      width: 900,
      height: 600,
      resizable: false,
      maxWidth: 900,
      maxHeight: 600,
      alwaysOnTop: false,
      // minimizable: false,
      backgroundColor: 'white',
      webPreferences: {
        //devTools: !app.isPackaged,
        nodeIntegration: true,
        worldSafeExecuteJavaScript: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      icon: 'src/assets/sass/images/icons/favicon.png',
      backgroundThrottling: false,
      autoHideMenuBar: true,
    });

    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools();
    }

    appElements.mainWindow = mainWindow;

    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('minimize', e => {
      if (process.platform === 'darwin') {
        e.preventDefault();
        mainWindow.hide();
      }
    });

    mainWindow.on('close', async e => {
      if (!forceQuit) {
        e.preventDefault();
        toggleDock(app, false);
        mainWindow.hide();
        console.log('mainWindow close');
      } else {
        console.log('forceQuit!');
        await appElements.quitApps();
        app.exit();
      }
    });

    mainWindow.on('show', () => { });

    // In production, set the initial browser path to the local bundle generated
    // by the Create React App build process.
    // In development, set it to localhost to allow live/hot-reloading.
    const appURL = app.isPackaged
      ? url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
      : 'http://localhost:3000';

    mainWindow.loadURL(appURL);
  }catch(err){
    trackEvent('Catch-Error', { Source: "createWindow" , Stamp: getCurrentTimeStamp() });
  }
}

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
function setupLocalFilesNormalizerProxy() {
  try{
  protocol.registerHttpProtocol(
    'file',
    (request, callback) => {
      const url = request.url.substr(8);
      callback({ path: path.normalize(`${__dirname}/${url}`) });
    },
    error => {
      if (error) console.error('Failed to register protocol');
    },
  );
  }catch(err){
    trackEvent('Catch-Error', { Source: "setupLocalFilesNormalizerProxy" , Stamp: getCurrentTimeStamp() });
  }
}

let tray;

function createTray() {
  try{
  tray = new Tray(path.join(__dirname, 'tray16Template@2x.png'));
  tray.setToolTip('espressoFlow');
  tray.setIgnoreDoubleClickEvents(true);
  const contextMenu = new Menu();
  contextMenu.append(new MenuItem({ type: 'separator' }));
  contextMenu.append(
    new MenuItem({
      icon: path.join(__dirname, 'tray16@2x.png'),
      label: 'Launch espressoFlow',
      click: function () {
        toggleDock(app, true);
        if (process.platform !== 'darwin') {
          mainWindow.restore();
        } else {
          mainWindow.show();
        }

      },
    }),
  );
  contextMenu.append(new MenuItem({ type: 'separator' }));
  contextMenu.append(
    new MenuItem({
      label: 'Quit Espresso',
      click: async function () {
        try {
          tray.destroy();
        } catch (er) {
          console.log(er)
        }
        globalShortcut.unregister('CommandOrControl+Shift+J');
        // Unregister all shortcuts.
        globalShortcut.unregisterAll();
        if (appElements.quitApps) {
          await appElements.quitApps();
        }
        app.exit();
      },
    }),
  );
  tray.on('right-click', () => tray.popUpContextMenu(contextMenu));
  tray.on('click', () => {
    if (process.platform !== 'darwin') {
      mainWindow.restore();
    } else {
      mainWindow.show();
    }
  });
  appElements.tray = tray;
  return tray;
}catch(err){
  trackEvent('Catch-Error', { Source: "createTray" , Stamp: getCurrentTimeStamp() });
}
}

const toggleWindow = async () => {
  try{
    const window = appElements.trayWindow;
    if (window.isVisible()) {
      window.hide();
    } else {
      try {
        const user = store.get('user');
        if (user && user.email) {
          showWindow(window);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }catch(err){
    trackEvent('Catch-Error', { Source: "toggleWindow" , Stamp: getCurrentTimeStamp() });
  }
};

const getWindowPosition = window => {
  const windowBounds = window.getBounds();
  const trayBounds = appElements.tray.getBounds();

  let x, y;
  if (process.platform !== 'darwin') {
    x = trayBounds.x - trayWidth;
    y = trayBounds.y - trayHeight;
  } else {
    // Center window horizontally below the tray icon
    x = Math.round(
      trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2,
    );
    // Position window 4 pixels vertically below the tray icon
    y = Math.round(trayBounds.y + trayBounds.height + 3);
  }
  return { x, y };
};

const showWindow = window => {
  const { x, y } = getWindowPosition(window);
  window.setPosition(x, y, false);
  window.show();
  window.focus();
};

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.

const toggleDock = async (app, show) => {
  if (appElements.ipcToggleRunning) return;
  appElements.ipcToggleRunning = true;
  if (!show) {
    if (process.platform === 'darwin') {
      app.dock.hide();
    } else {
      appElements.mainWindow.setSkipTaskbar(true);
    }
  } else {
    if (process.platform === 'darwin') {
      await app.dock.show();
    } else {
      await appElements.mainWindow.setSkipTaskbar(false);
    }
  }
  appElements.ipcToggleRunning = false;
};

const initialMainApp = () => {
  try {
    createWindow();
    // createContextWindow();

    appElements.tray = createTray();
    const {
      startDeviceListener,
      stopDeviceListener,
      quitApps,
    } = initLib(
      store,
      mainWindow,
      appElements.trayWindow,
      appElements.contextWindow,
    );

    appElements.initDeviceListener = startDeviceListener;
    appElements.removeDeviceListener = stopDeviceListener;
    appElements.quitApps = quitApps;

    /*  appElements.quitFlowHelper = quitFlowHelper;
    appElements.quitFlowWindow = quitFlowWindow; */

    appElements.mainWindow.webContents.on('dom-ready', () => {
      const user = store.get('user');
      if (user && user.email && user.email !== '') {
        appElements.mainWindow.webContents.send('auth', user);
      }
      appElements.mainWindow.webContents.send('theme','dark');
    });

    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('getVersion', app.getVersion());

      let loginSettings = app.getLoginItemSettings();
      if (loginSettings.wasOpenedAtLogin && process.platform === 'darwin') {
        mainWindow.hide();
      }
    });

    ipcMain.on('getTheme', (event, arg) => {
      appElements.mainWindow.webContents.send('theme', 'dark');
    });

    ipcMain.on('setTrayHeight', async (event, arg) => {
      appElements.trayWindow.setSize(trayWidth, trayHeight);
    });

    ipcMain.on('toggleDock', async (event, arg) => {
      toggleDock(app, arg);
    });

    ipcMain.on('restartFlow', (event, arg) => {
      app.relaunch()
      app.exit()
    });

    ipcMain.once('getUpdatedFlag', async () => {
      mainWindow.webContents.send('updatedFlag', store.get('updatedFlag'));
      store.set('updatedFlag', false);
    });

    ipcMain.once('getWorkspaceEnabled', async () => {
      let workspaceFlag = store.get('workspaceEnabled');
      if (workspaceFlag !== true && workspaceFlag !== false) {
        workspaceFlag = true;
      }
      mainWindow.webContents.send('workspaceEnabled', workspaceFlag);
    });

  } catch (error) {
    console.log(error)
    trackEvent('Catch-Error', { Source: "initialMainApp" , Stamp: getCurrentTimeStamp() });
  }

};

app.whenReady().then(async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      launchAtStartup();
    }
    setupLocalFilesNormalizerProxy();
    createLoginWindow();

    const user = store.get('user');

    if (!user) {
      appElements.loginWindow.show();
    } else {
      initialMainApp();
    }

    autoUpdater.on('download-progress', info => {
      console.log('download progress');
    });

    autoUpdater.on('update-available', updateInfo => {
      console.log('update available');
    });
    autoUpdater.on('update-downloaded', updateInfo => {
      console.log('update downloaded');
      const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message:
          process.platform === 'win32'
            ? updateInfo.releaseNotes
            : updateInfo.releaseName,
        detail:
          'A new version has been downloaded. Restart the application to apply the updates.',
      };

      store.set('updatedFlag', true);

      dialog.showMessageBox(dialogOpts).then(async returnValue => {
        if (returnValue.response === 0) {
          forceQuit = true;
          try {
            autoUpdater.quitAndInstall();
          } catch (e) {
            console.log(e);
          }
        }
      });
    });

    if (process.env.NODE_ENV === 'development') {
      autoUpdater.checkForUpdates();
    } else {
      console.log('start auto update listener');
      autoUpdater.checkForUpdatesAndNotify();
      setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
      }, 600000 * 24);
    }

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      try {
        if (
          BrowserWindow.getAllWindows().length === 0 &&
          !appElements.mainWindow
        ) {
          createWindow();
        } else {
          const user = store.get('user');
          if (!user) {
            appElements.loginWindow.show();
          } else {
            appElements.mainWindow.show();
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    });
  } catch (e) {
    console.log(e.message);
    trackEvent('Catch-Error', { Source: "whenReady" , Stamp: getCurrentTimeStamp() });
  }
});

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on('window-all-closed', function (e) {
  try{
  console.log('All closed!');
  if (process.platform !== 'darwin') {
    globalShortcut.unregister('CommandOrControl+Shift+J');
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
    app.quit();
  }
  }catch(err){
    trackEvent('Catch-Error', { Source: "whenAllClosed" , Stamp: getCurrentTimeStamp() });
  }
});


try{
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    try {
      if (appElements.tray) {
        appElements.tray.destroy();
      }
    } catch (error) {
      console.log(error)
    }
    //
    // app.quit()
  })

}
}
catch(err){
  trackEvent('Catch-Error', { Source: "initialMainApp", Stamp: getCurrentTimeStamp()  });
}

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
// const allowedNavigationDestinations = 'https://my-electron-app.com';
app.on('web-contents-created', (event, contents) => {
  try{
    contents.on('new-window', newEvent => {
      //console.log("Blocked by 'new-window'")
      newEvent.preventDefault();
    });

    contents.on('will-navigate', newEvent => {
      //console.log("Blocked by 'will-navigate'")
      newEvent.preventDefault();
    });

    contents.setWindowOpenHandler(({ url }) => {
      if (
        url.startsWith('https://support.espres.so/') ||
        url.startsWith('https://espres.so/') ||
        url.startsWith('https://my.espres.so/') ||
        url.startsWith('https://espres.zendesk.com/') ||
        url.startsWith('https://espres.so/software-license-agreement/')
      ) {
        setImmediate(() => {
          shell.openExternal(url);
        });
        return { action: 'allow' };
      } else {
        return { action: 'deny' };
      }
    });
  }catch(err){
    trackEvent('Catch-Error', { Source: "web-contents-created", Stamp: getCurrentTimeStamp()  });
  }
});

const deeplink = new Deeplink({
  app,
  mainWindow: appElements.mainWindow,
  protocol: 'espressoFlow',
  isDev,
  debugLogging: false,
});

deeplink.on('received', async link => {
  try {
    const params = parseQuery(link);
    let user = {
      email: '',
      name: '',
    };
    if (params.id_token) {
      //console.log(params);
      const decodedToken = jwt_decode(params.id_token);
      user.email = decodedToken.email;
    } else if (params['#access_token']) {
      const access_token = params['#access_token'];
      const res = await axios.get(
        `https://graph.facebook.com/me?fields=email,name&access_token=${access_token}`,
      );
      const resData = res.data;
      user.email = resData.email;
      user.name = resData.name;
    } else {
      user.email = params.email;
      user.name = params.name;
    }
    if (user.email === '') return;
    store.set('user', user);
    appElements.loginWindow.hide();
    if (!appElements.mainWindow) {
      initialMainApp();
    } else {
      appElements.initDeviceListener();
      appElements.mainWindow.show();
      createTray();
    }
    appElements.mainWindow.webContents.send('auth', user);
  } catch (error) {
    console.log(error);
    trackEvent('Catch-Error', { Source: "deeplink" , Stamp: getCurrentTimeStamp() });
  }
});