const { ipcMain, systemPreferences } = require('electron');
const { store } = require('../store.js');
const { postNotification } = require('../connections/mac');
const find = require('find-process');
const { trackEvent, getCurrentTimeStamp } = require('../analytics.js');
// const { ColorCombinations } = require('../../../src/utils/utility');

const defaultShortcuts = {
  leftHalf: {
    displayString: '⌃⌥←',
    keyCode: 123,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  rightHalf: {
    displayString: '⌃⌥→',
    keyCode: 124,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  topHalf: {
    displayString: '⌃⌥↑',
    keyCode: 126,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  bottomHalf: {
    displayString: '⌃⌥↓',
    keyCode: 125,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  maximize: {
    displayString: '⌃⌥↩',
    keyCode: 36,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  nextDisplay: {
    displayString: '⌃⌥⌘→',
    keyCode: 124,
    modifierFlag: ['Cmd', 'Ctrl', 'Opt'],
  },
  previousDisplay: {
    displayString: '⌃⌥⌘←',
    keyCode: 123,
    modifierFlag: ['Cmd', 'Ctrl', 'Opt'],
  },
  topLeft: {
    displayString: '⌃⌥U',
    keyCode: 32,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  topRight: {
    displayString: '⌃⌥I',
    keyCode: 32,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  bottomLeft: {
    displayString: '⌃⌥J',
    keyCode: 32,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  bottomRight: {
    displayString: '⌃⌥K',
    keyCode: 32,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  firstThird: {
    displayString: '⌃⌥D',
    keyCode: 32,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  centerThird: {
    displayString: '⌃⌥F',
    keyCode: 32,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  lastThird: {
    displayString: '⌃⌥G',
    keyCode: 32,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  firstTwoThirds: {
    displayString: '⌃⌥E',
    keyCode: 32,
    modifierFlag: ['Ctrl', 'Opt'],
  },
  lastTwoThirds: {
    displayString: '⌃⌥T',
    keyCode: 32,
    modifierFlag: ['Ctrl', 'Opt'],
  },
};

const initWorkspaceIPC = (flowlib, mainWindow) => {
  try{
    let flowPermissions = false;
    let conflictingApp = '';
    ipcMain.on('startFlowWindow', async (event, arg) => {
      if (process.platform === 'darwin' && store.get('workspaceEnabled')) {
        await flowlib.startFlowWindow();
        console.log('start flow window');
      }
    });

    ipcMain.on('quitFlowWindow', async (event, arg) => {
      if (process.platform === 'darwin') {
        await flowlib.quitFlowWindow();
      }
    });

    ipcMain.on('promptFlowWindowAccessibility', (event, arg) => {
      postNotification('com.espresso.flow.FlowWindow.openAccessibility', {});
    });

    ipcMain.handle('checkFlowWindowPermissions', (event, arg) => {
      if (!flowPermissions) {
        postNotification('com.espresso.flow.FlowWindow.requestPermissions', {});
      } else {
        mainWindow.webContents.send('flowWindowAccessibility', 1);
      }

      return true;
    });

    ipcMain.on('checkFlowWindowConflictingApp', (event, arg) => {
      try {
        if (conflictingApp === '') {
          mainWindow.webContents.send('conflictingApp', 'none');
        } else {
          mainWindow.webContents.send('conflictingApp', conflictingApp);
        }
      } catch (error) {
        console.log("checkFlowWindowConflictingApp: ", error.message);
      }
    });

    if (process.platform === 'darwin') {
      systemPreferences.subscribeNotification(
        'com.espresso.flow.FlowWindow.accessibility',
        (event, userInfo) => {
          if (userInfo.trusted === 1 || userInfo.trusted) {
            flowPermissions = true;
          }

          mainWindow.webContents.send(
            'flowWindowAccessibility',
            userInfo.trusted,
          );
        },
      );
    }

    ipcMain.on('setSnapShortcut', (event, arg) => {
      const { action, modifierFlag, keyCode, displayString } = arg;
      const shortcuts = store.get('shortcuts');

      if (!modifierFlag.length) {
        return;
      }

      if (!shortcuts) {
        store.set('shortcuts', {
          ...defaultShortcuts,
          [action]: {
            displayString,
            keyCode,
            modifierFlag,
          },
        });
      } else {
        const updatedShortcuts = {
          ...shortcuts,
          [action]: {
            displayString,
            keyCode,
            modifierFlag,
          },
        };

        store.set('shortcuts', updatedShortcuts);
      }

      systemPreferences.postNotification(
        'com.espresso.flow.FlowWindow.sync',
        {
          method: 'POST',
          shortcuts: store.get('shortcuts'),
        },
        true,
      );
    });

    ipcMain.on('postSnapShortcuts', (event, arg) => {
      const { method } = arg;
      if (method === 'GET') {
        if (store.get('shortcuts')) {
          mainWindow.webContents.send('snapShortcuts', store.get('shortcuts'));
          return;
        }
      } else if (method === 'RESET') {
        store.set('shortcuts', defaultShortcuts);
        mainWindow.webContents.send('snapShortcuts', defaultShortcuts);
      }

      systemPreferences.postNotification(
        'com.espresso.flow.FlowWindow.sync',
        {
          method,
        },
        true,
      );
    });

    if (process.platform === 'darwin') {
      systemPreferences.subscribeNotification(
        'com.espresso.flow.FlowWindow.sync-shortcuts',
        (event, userInfo) => {
          mainWindow.webContents.send('snapShortcuts', userInfo);
        },
      );

      systemPreferences.subscribeNotification(
        'com.espresso.flow.FlowWindow.snap',
        (event, userInfo) => {
          trackEvent('snap', {action: userInfo, Stamp: getCurrentTimeStamp()});
        },
      );
    }

    ipcMain.on('setWorkspaceArrangement', async (event, arg) => {
      if (process.platform === 'darwin') {
        const processList = await find('name', 'Espresso Flow Window');

        if (processList && processList.length > 0) {
          const workspace = arg;
          systemPreferences.postNotification(
            'com.espresso.flow.FlowWindow.workspace',
            workspace,
            true,
          );
          return;
        } else if (processList.length === 0) {
          mainWindow.webContents.send(
            'workspaceDone',
            'Espresso workspace launcher is not running.',
          );
        }
      }
    });

    systemPreferences.subscribeNotification(
      'com.espresso.flow.FlowWindow.workspace',
      (event, userInfo) => {
        const { message } = userInfo;
        //const displays = flowlib._getDisplaysInfo();

        if (message) {
          //mainWindow.webContents.send('displays', displays);
          mainWindow.webContents.send('workspaceDone', message);
        }
      },
      true,
    );

    if (process.platform === 'darwin') {
      systemPreferences.subscribeNotification(
        'com.espresso.flow.FlowWindow.apps',
        (event, userInfo) => {
          const savedApps = store.get('savedApps') || [];
          const contextApps = store.get('contextApps') || [];
          const allApps = Object.values(userInfo) || [];
          store.set('allApps', allApps);

          let found = false;
          let newAppsList = [];
          let newContextAppsList = [];

          allApps.map(app => {
            found = false;
            savedApps.every(_app => {
              if (_app === app.name) {
                found = true;
                return false;
              }
              return true;
            });
            if (found) {
              newAppsList.push({ ...app, checked: 'true' });
            } else {
              newAppsList.push({ ...app, checked: 'false' });
            }

            found = false;

            contextApps.every(_app => {
              if (_app === app.name) {
                found = true;
                return false;
              }
              return true;
            });

            if (found) {
              newContextAppsList.push({ ...app, checked: 'true' });
            } else {
              newContextAppsList.push({ ...app, checked: 'false' });
            }
          });

          if (savedApps.length === 0) {
            newAppsList.forEach(app => {
              if (
                app.name === 'Calendar' ||
                app.name === 'Mail' ||
                app.name === 'Notes' ||
                app.name === 'Safari'
              ) {
                app.checked = 'true';
              }
            });
          }

          mainWindow.webContents.send('returnedApps', {
            workspace: newAppsList,
            context: newContextAppsList,
          });
        },
      );
    }

    ipcMain.on('getWorkspaces', (event, arg) => {
      let workspaces = store.get('workspaces');
      if (!workspaces) {
        workspaces = [];
      }

      mainWindow.webContents.send('workspaces', workspaces);
    });

    ipcMain.on('saveWorkspace', (event, arg) => {
      try {
        const workspace = arg;
        const workspacesStore = store.get('workspaces');

        if (!workspacesStore) {
          store.set('workspaces', [workspace]);
          trackEvent('workspace', { create: workspace.id,  Stamp: getCurrentTimeStamp() });
        } else {
          const workspaceIndex = workspacesStore.findIndex(
            ws => ws.id === workspace.id,
          );
          if (workspaceIndex > -1) {
            let newWorkspaces = [
              ...workspacesStore.slice(0, workspaceIndex),
              workspace,
              ...workspacesStore.slice(workspaceIndex + 1),
            ];

            store.set('workspaces', newWorkspaces);
            trackEvent('workspace', { edit: workspace.id ,  Stamp: getCurrentTimeStamp()});
          } else {
            store.set('workspaces', [...workspacesStore, workspace]);
            trackEvent('workspace', { create: workspace.id,  Stamp: getCurrentTimeStamp() });
          }
        }

        mainWindow.webContents.send('savedWorkspace', workspace);
      } catch (error) {
        mainWindow.webContents.send('savedWorkspace', error.message);
      }
    });

    ipcMain.on('deleteWorkspace', (event, arg) => {
      try {
        const workspaceId = arg;
        const workspaces = store.get('workspaces');
        const updatedWorkspaces = workspaces.filter(ws => ws.id !== workspaceId);
        store.set('workspaces', updatedWorkspaces);
        mainWindow.webContents.send('deletedWorkspace', workspaceId);
      } catch (error) {
        mainWindow.webContents.send('deletedWorkspace', { error: error.message });
      }
    });

    ipcMain.on('getApps', (event, arg) => {
      systemPreferences.postNotification(
        'com.espresso.flow.FlowWindow.get-apps',
        {},
        true,
      );
    });

    ipcMain.handle('getWebpages', async (event, data) => {
      try {
        const webpagesList = store.get('savedWebpages') || [];
        return webpagesList;
      } catch (error) {
        return error;
      }
    });

    ipcMain.handle('saveWebpages', async (event, webpageData) => {
      try {
        const savedWebpages = store.get('savedWebpages') || [];
        const webpageIndex = savedWebpages.findIndex(
          page => page.id === webpageData.id,
        );
        if (webpageIndex === -1) {
          store.set('savedWebpages', [...savedWebpages, webpageData]);
        } else {
          const updatedWebpages = [
            ...savedWebpages.slice(0, webpageIndex),
            webpageData,
            ...savedWebpages.slice(webpageIndex + 1),
          ];
          store.set('savedWebpages', updatedWebpages);
          // update all saved workspaces
          const workspaces = store.get('workspaces') || [];
          const updatedWorkspaces = workspaces.map(workspace => {
            let displays = [];

            for (const display of workspace.displays) {
              let apps = [];
              for (const app of display.apps) {
                if (app.id === webpageData.id) {
                  apps.push({
                    ...app,
                    urls: webpageData.urls,
                  });
                } else {
                  apps.push(app);
                }
              }
              displays.push({
                ...display,
                apps,
              });
            }

            return {
              ...workspace,
              displays,
            };
          });

          store.set('workspaces', updatedWorkspaces);
        }

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    });

    ipcMain.handle('removeWebpage', async (event, id) => {
      try {
        const savedWebpages = store.get('savedWebpages');
        store.set(
          'savedWebpages',
          savedWebpages.filter(page => page.id !== id),
        );
        return true;
      } catch (error) {
        return false;
      }
    });

    ipcMain.on('setSavedApps', (event, arg) => {
      try {
        const { workspace, context } = arg;
        store.set('savedApps', workspace);
        store.set('contextApps', context);
      } catch (error) {
        console.log(error);
      }
    });

    ipcMain.on('getSavedApps', (event, arg) => {
      try {
        const savedApps = store.get('savedApps') || [];
        mainWindow.webContents.send('returnedSavedApps', savedApps);
      } catch (error) {
        console.log(error);
      }
    });



    ipcMain.handle('getTagOptions', async (event) => {
      try {
        const tagOptions = store.get('workspaceTagOptions');
        return tagOptions;
      } catch (error) {
        return error;
      }
    });

    ipcMain.on('getTagOptions', (event) => {
      try {
        const tagOptions = store.get('workspaceTagOptions');
        mainWindow.webContents.send('returnedTagOptions', tagOptions);
      } catch (error) {
        console.log(error);
      }
    });

    ipcMain.handle('setTagOptions', async (event, arg) => {
      try {
        const { tagOptions } = arg;
        store.set('workspaceTagOptions', tagOptions);
      } catch (error) {
        console.log(error)
        return error;
      }
    });

    ipcMain.on('setTagOptions', (event, arg) => {
      try {
        const { tagOptions } = arg;
        store.set('workspaceTagOptions', tagOptions);
      } catch (error) {
        console.log(error);
      }
    });
  }catch(err){
    trackEvent('Catch-Error', { Source: "mac_ipc",  Stamp: getCurrentTimeStamp() });
  }
};

module.exports = { initWorkspaceIPC };
