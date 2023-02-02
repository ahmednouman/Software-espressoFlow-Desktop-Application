// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const { shell } = require('electron');
const { v4: uuidv4 } = require('uuid');

// As an example, here we use the exposeInMainWorld API to expose the browsers
// and node versions to the main window.
// They'll be accessible at "window.versions".
let quitProcessAdded = false;
let toggleStatusAdded = false;
let permissionAdded = false;
let myCallback = null;
let resetFadeCalled = false;
let syncCalled = false;
let ddcValuesCalled = false;
let authCalled = false;
let resetContextCalled = false;
let checkPermissionCalled = false;
let checkFlowWindowPermissionCalled = false;

// function to capture events

function captureEvent(action, label, value) {
  // if (typeof label != 'string') {
  //   label = JSON.stringify(label);
  // }
  if (navigator.onLine) {
    ipcRenderer.send('captureEvent', { action: action, label: label });
  } else {
    console.log('no internet, event is not captured');
  }
}

contextBridge.exposeInMainWorld('electron', {
  notificationAPI: {
    sendNotification(message) {
      ipcRenderer.send('notify', message);
    },
  },
  version: async setVersion => {
    const result = await ipcRenderer.invoke('get-version');
    setVersion(result)
    // ipcRenderer.on('send-version', (event, arg) => {
    //   console.log(arg)
    //   setVersion(arg);
    // });
  },

  permission: callback => {
    myCallback = callback;
    if (permissionAdded) return;
    ipcRenderer.on('permission', (event, arg) => {
      if (myCallback != null) {
        myCallback(arg);
      }
    });
    permissionAdded = true;
  },
  fileAPI: {
    getPath(file_url) {
      return path.join(__dirname, '../../', 'assets/sass/images', file_url);
    },
    openBrowser(url) {
      shell.openExternal(url);
    },
    getDisplayList(display) {
      ipcRenderer.send('setDisplay', display);
    },
  },
  createBorder: display => {
    ipcRenderer.send('createBorder', display);
  },
  removeBorder: () => {
    ipcRenderer.send('removeBorder');
  },
  quitProcess: disconnect => {
    if (quitProcessAdded) return;
    quitProcessAdded = true;
    ipcRenderer.on('quitProcess', async (event, arg) => {
      try {
        await disconnect();
      } catch (error) {
        console.log(error);
      }
      ipcRenderer.sendSync('quit-reply');
    });
  },
  dockStatus: callback => {
    if (toggleStatusAdded) return;
    ipcRenderer.on('toggleDock', (event, arg) => {
      console.log(arg);
      callback(arg);
    });
    toggleStatusAdded = true;
  },
  toggleDock: state => {
    ipcRenderer.send('toggleDock', state);
  },
  getTheme: callback => {
    ipcRenderer.on('theme', (event, arg) => {
      callback(arg);
    });
  },
  requestTheme: () => {
    ipcRenderer.send('requestTheme');
  },

  displays: callback => {
    ipcRenderer.on('displays', async (event, arg) => {
      try {
        if (arg.length) {
          ipcRenderer.send('setDisplay', arg);
          callback(arg);
        }
      } catch (e) {
        console.log(e);
      }
    });
  },
  getDisplaysInfo: async () => {
    ipcRenderer.send('getDisplays');
  },
  setBrightness: (window, id, value) => {
    captureEvent('Setting-Click', { Brightness: value });
    ipcRenderer.send('setBrightness', { window, id, value });
  },
  setBrightnessSync: async data => {
    ipcRenderer.send('setBrightnessSync', data);
  },
  setContrast: (id, value) => {
    captureEvent('Setting-Click', { Contrast: value });
    ipcRenderer.send('setContrast', { id, value });
  },
  setColourPreset: (id, value) => {
    captureEvent('Setting-Click', { Colour: value });
    ipcRenderer.send('setColourPreset', { id, value });
  },
  setVolume: (id, value) => {
    captureEvent('Setting-Click', { Volume: value });
    ipcRenderer.send('setVolume', { id, value });
  },
  setLockedRotation: async (window, id, value) => {
    ipcRenderer.send('setLockedRotation', { window, id, value });
  },
  setRotate: async (window, id, value) => {
    ipcRenderer.send('setRotate', { window, id, value });
  },
  setMirrorMode: async (id, value) => {
    captureEvent('Setting-Click', { Mirror: value });
    ipcRenderer.send('setMirrorMode', { id, value });
  },
  setLocation: values => {
    captureEvent('Displays-Arranged', { Arrangement: values });
    ipcRenderer.send('setLocation', { values });
  },
  getTutorial: callback => {
    const unsubscribe = ipcRenderer.on('getTutorial', (event, arg) => {
      callback(arg);
    });
    return () => unsubscribe.removeAllListeners('getTutorial');
  },
  getFirmwareUpdated: async () => {
    const value = await ipcRenderer.invoke('getFirmwareUpdated');
    return value;
  },
  setFirmwareUpdated: value => {
    ipcRenderer.send('setFirmwareUpdated', value);
  },
  onWorkspaceEnabled: callback => {
    ipcRenderer.on('workspaceEnabled', (event, arg) => {
      callback(arg);
    });
  },
  onUpdatedFlag: callback => {
    ipcRenderer.on('updatedFlag', (event, arg) => {
      callback(arg);
    });
  },
  getUpdatedFlag: async () => {
    ipcRenderer.send('getUpdatedFlag');
  },
  setTutorialDone: () => {
    ipcRenderer.send('setTutorialDone', true);
  },
  checkPermissions: () => {
    // if (checkPermissionCalled) return;
    // checkPermissionCalled = true;
    ipcRenderer.send('checkPermissions');
  },
  onCheckPermissions: () => {
    ipcRenderer.on('checkPermissions', (event, arg) => {
      checkPermissionCalled = false;
    });
  },
  checkFlowWindowPermissions: async () => {
    if(process.platform === "darwin"){
      const result = await ipcRenderer.invoke('checkFlowWindowPermissions');
      return result;
    } 
    return 1

  },
  onFlowWindowPermissions: callback => {
    const unsubscribe = ipcRenderer.on(
      'flowWindowAccessibility',
      (event, arg) => {
        callback(arg);
      },
    );

    return () => unsubscribe.removeAllListeners('flowWindowAccessibility');
  },
  checkFlowWindowConflictingApp: () => {
    ipcRenderer.send('checkFlowWindowConflictingApp');
  },
  onConflictingApp: callback => {
    const unsubscribe = ipcRenderer.on('conflictingApp', (event, arg) => {
      if (arg) {
        callback(arg);
      }
    });

    return () => unsubscribe.removeAllListeners('conflictingApp');
  },
  promptFlowWindowAccessibility: () => {
    ipcRenderer.send('promptFlowWindowAccessibility');
  },
  requestPermissions: () => {
    ipcRenderer.send('requestPermissions');
  },
  startFlowHelper: () => {
    ipcRenderer.send('startFlowHelper');
  },
  startFirmwareUpdateTool: () => {
    ipcRenderer.send('startFirmwareUpdateTool');
  },
  reinitialise: () => {
    ipcRenderer.send('reinitialise');
  },
  quitFlowHelper: () => {
    ipcRenderer.send('quitFlowHelper');
  },
  rotationChanged: callback => {
    ipcRenderer.on('rotationChanged', async (event, arg) => {
      callback(arg);
    });
  },
  triggerShortcut: async shortcut => {
    await ipcRenderer.invoke('triggerShortcut', shortcut);
  },
  closeContext: async () => {
    await ipcRenderer.invoke('closeContext');
  },
  resetContext: callback => {
    if (resetContextCalled) return;
    ipcRenderer.on('reset-context', (event, arg) => {
      callback();
    });
    resetContextCalled = true;
  },
  resetFade: callback => {
    if (resetFadeCalled) return;
    ipcRenderer.on('resetFade', () => {
      callback();
    });
    resetFadeCalled = true;
  },
  sync: callback => {
    if (syncCalled) return;
    ipcRenderer.on('sync', (event, arg) => {
      console.log(arg);
      callback(arg);
    });
    syncCalled = true;
  },
  refreshTray: () => {
    ipcRenderer.on('refresh ddc values', (event, arg) => {
      ipcRenderer.send('getDisplaysTray');
    });
  },
  requestLocation: id => {
    ipcRenderer.send('getLocation', { id });
  },
  getLocation: async callback => {
    ipcRenderer.on('location', (event, arg) => {
      callback(arg);
    });
  },
  getDdcValues: (id, type) => {
    ipcRenderer.send('getDdcValues', { id, type });
  },
  ddcValues: callback => {
    if (ddcValuesCalled) return;
    ipcRenderer.on('ddcValues', (event, arg) => {
      callback(arg);
    });
    ddcValuesCalled = true;
  },
  setTrayHeight: height => {
    console.log('height ', height);
    ipcRenderer.send('setTrayHeight', height);
  },
  auth: callback => {
    if (authCalled) return;
    ipcRenderer.on('auth', (event, arg) => {
      callback(arg);
    });
    authCalled = true;
  },
  openAuthUrl: platform => {
    let authUrl = '';
    let redirectUri = '';
    let scope = '';
    let state = '';
    let clientId = '';
    let response_type = '';
    switch (platform) {
      case 'google':
        let client_uri =
          '779382148399-t7gt4dvs0udpeqrbokfuvu5tdc1s1nib.apps.googleusercontent.com';
        redirectUri = 'https://my-api.espres.so/google/callback/desktop';
        scope = 'email profile';
        response_type = 'code id_token';
        authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${client_uri}&redirect_uri=${redirectUri}&response_type=${response_type}&scope=${scope}&prompt=consent`;
        break;
      case 'facebook':
        redirectUri = 'https://my-api.espres.so/facebook/callback/desktop';
        clientId = '245771964228912';
        state = 'espressodesktop';
        response_type = 'code token';
        scope = 'public_profile email';
        authUrl = `https://www.facebook.com/v13.0/dialog/oauth?
        client_id=${clientId}
        &redirect_uri=${redirectUri}
        &state=${state}`;
        authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${response_type}&scope=${scope}&state=${state}`;
        break;
      case 'apple':
        clientId = 'so.espres.my.serviceid';
        scope = 'name email';
        response_type = 'code id_token';
        redirectUri = 'https://my-api.espres.so/apple/callback/desktop';
        let response_mode = 'form_post';
        state = 'espressodesktop';
        let nouce = uuidv4();
        authUrl = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${response_type}&scope=${scope}&response_mode=${response_mode}&state=${state}&nouce=${nouce}`;
        break;
      default:
        return;
    }

    shell.openExternal(authUrl);
  },
  openEspressoUrl: url => {
    const safeUrls = [
      'https://my.espres.so/signup',
      'https://my.espres.so/forgot-password',
    ];

    if (safeUrls.includes(url)) {
      shell.openExternal(url);
    }
  },
  requestUser: () => {
    ipcRenderer.send('requestUser');
  },
  setLogin: data => {
    captureEvent('Sign-Action', 'Sign-in');
    ipcRenderer.send('setLogin', data);
  },
  signout: () => {
    captureEvent('Sign-Action', 'Sign-out');
    ipcRenderer.send('signout');
  },
  captureEvent: (action, label) => {
    captureEvent(action, label);
  },
  setTouchEnabled: async data => {
    ipcRenderer.send('touchEnabled', data);
  },
  setWorkspaceEnabled: async data => {
    ipcRenderer.send('setWorkspaceEnabled', data);
  },
  getWorkspaceEnabled: async () => {
    ipcRenderer.send('getWorkspaceEnabled');
  },
  startFlowWindow: () => {
    ipcRenderer.send('startFlowWindow');
  },
  postSnapShortcuts: data => {
    ipcRenderer.send('postSnapShortcuts', data);
  },
  setSnapShortcut: data => {
    ipcRenderer.send('setSnapShortcut', data);
  },
  snapShortcuts: callback => {
    const unsubscribe = ipcRenderer.on('snapShortcuts', (event, arg) => {
      callback(arg);
    });

    return () => unsubscribe.removeAllListeners('snapShortcuts');
  },
  getWorkspaces: () => {
    //console.log('getting wospa');
    ipcRenderer.send('getWorkspaces');
  },
  returnedWorkspaces: callback => {
    const unsubscribe = ipcRenderer.on('workspaces', (event, arg) => {
      callback(arg);
    });
    return () => unsubscribe.removeAllListeners('workspaces');
  },
  saveWorkspace: workspace => {
    ipcRenderer.send('saveWorkspace', workspace);
  },
  savedWorkspace: callback => {
    ipcRenderer.on('savedWorkspace', (event, arg) => {
      callback(arg);
    });
  },
  deleteWorkspace: id => {
    captureEvent('workspace', { deleteWorkspace: id });
    ipcRenderer.send('deleteWorkspace', id);
  },
  onDeletedWorkspace: callback => {
    let eventTarget = ipcRenderer.on('deletedWorkspace', (event, arg) => {
      callback(arg);
    });

    return () => eventTarget.removeAllListeners('deletedWorkspace');
  },
  setWorkspaceArrangement: workspace => {
    captureEvent('workspace', { setWorkspace: workspace.id });
    ipcRenderer.send('setWorkspaceArrangement', workspace);
  },
  onWorkspaceDone: callback => {
    const unsubscribe = ipcRenderer.on('workspaceDone', (event, arg) => {
      const message = arg;
      callback(message);
    });
    return () => unsubscribe.removeAllListeners('workspaceDone');
  },
  getApps: () => {
    // console.log('get apps --');
    ipcRenderer.send('getApps');
  },
  returnedApps: callback => {
    const unsubscribe = ipcRenderer.on('returnedApps', (event, arg) => {
      callback(arg);
    });
    return () => unsubscribe.removeAllListeners('returnedApps');
  },
  setSavedApps: apps => {
    ipcRenderer.send('setSavedApps', apps);
  },
  getWebPages: async () => {
    const result = await ipcRenderer.invoke('getWebpages');
    return result;
  },
  removeWebpage: async id => {
    const result = await ipcRenderer.invoke('removeWebpage', id);
    return result;
  },
  saveWebpages: async webpageData => {
    const result = await ipcRenderer.invoke('saveWebpages', webpageData);
    return result;
  },
  getContextShortcuts: async () => {
    const result = await ipcRenderer.invoke('getContextShortcuts');
    return result;
  },
  saveContextShortcut: async contextShortcut => {
    const result = await ipcRenderer.invoke(
      'saveContextShortcut',
      contextShortcut,
    );
    return result;
  },
  deleteContextShortcut: async id => {
    const result = await ipcRenderer.invoke('deleteContextShortcut', id);
    return result;
  },
  getAppContextShortcuts: async appName => {
    const result = await ipcRenderer.invoke('getAppContextShortcuts', appName);
    return result;
  },
  saveAppContextShortcuts: async (appName, contextShortcuts) => {
    const result = await ipcRenderer.invoke('saveAppContextShortcuts', {
      name: appName,
      shortcuts: contextShortcuts,
    });
    return result;
  },
  getPenActivate: async () => {
    return await ipcRenderer.invoke('getPenActivate');
  },
  penActivate: async () => {
    return await ipcRenderer.invoke('penActivate');
  },
  onPenActivate: callback => {
    const unsubscribe = ipcRenderer.on('onPenActivate', (event, arg) => {
      callback(arg);
    });
    return () => unsubscribe.removeAllListeners('onPenActivate');
  },
  getPenActions: async () => {
    return await ipcRenderer.invoke('getPenActions');
  },
  setPenAction: async data => {
    return await ipcRenderer.invoke('setPenAction', data);
  },
  onPenShortcuts: callback => {
    const unsubscribe = ipcRenderer.on('onPenShortcuts', (event, arg) => {
      callback(arg);
    });
    return () => unsubscribe.removeAllListeners('onPenActivate');
  },
  restartFlow: () => {
    ipcRenderer.send('restartFlow');
  },
  getOnboarding: async () => {
    return await ipcRenderer.invoke('getOnboarding');
  },
  setOnboarding: onboarding => {
    ipcRenderer.send('setOnboarding', onboarding);
  },


  getTagOptions: async () => {
    const result = await ipcRenderer.invoke('getTagOptions');
    return result;
  },
  returnedTagOptions: callback => {
    const unsubscribe = ipcRenderer.on('returnedTagOptions', (event, arg) => {
      callback(arg);
    });
    return () => unsubscribe.removeAllListeners('returnedTagOptions');
  },
  setTagOptions: async tagOptions => {
    const result = await ipcRenderer.invoke('setTagOptions', tagOptions);
    return result;
  },
});

window.ipcRenderer = require('electron').ipcRenderer;
