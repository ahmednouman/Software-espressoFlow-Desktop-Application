const { ipcMain, systemPreferences } = require('electron');
const { store } = require('../store.js');
const { postNotification } = require('../connections/mac');


const initContextIPC = (mainWindow, contextWindow) => {

  let contextAppName = ""
  let centerLocation = {
    x: 0,
    y: 0
  }
  let windowWidth = 300
  let windowHeight = 300

  ipcMain.handle('getContextShortcuts', (event, arg) => {
    return store.get('contextShortcuts') || [];
  });

  ipcMain.handle('saveContextShortcut', (event, arg) => {
    const contextShortcuts = store.get('contextShortcuts');
    if (!contextShortcuts) {
      store.set('contextShortcuts', [arg]);
      return [arg];
    } else {
      const contextShortcutMatch = contextShortcuts.findIndex(
        context => context.id === arg.id,
      );

      if (contextShortcutMatch > -1) {
        const updatedContextShortcuts = [
          ...contextShortcuts.slice(0, contextShortcutMatch),
          arg,
          ...contextShortcuts.slice(contextShortcutMatch + 1),
        ];
        store.set('contextShortcuts', updatedContextShortcuts);
      } else {
        store.set('contextShortcuts', [...contextShortcuts, arg]);
      }
    }

    return store.get('contextShortcuts');
  });

  ipcMain.handle('deleteContextShortcut', (event, arg) => {
    const contextShortcuts = store.get('contextShortcuts');
    const filteredContextShortcuts = contextShortcuts.filter(
      context => context.id !== arg,
    );
    store.set('contextShortcuts', filteredContextShortcuts);
    return filteredContextShortcuts;
  });

  ipcMain.handle('getAppContextShortcuts', (event, arg) => {
    const appContextShortcuts = store.get(`context-${arg}`) || [];
    return appContextShortcuts;
  });

  ipcMain.handle('saveAppContextShortcuts', (event, arg) => {
    const { name, shortcuts } = arg;
    const result = store.set(`context-${name}`, shortcuts);
    return result;
  });

  ipcMain.handle('penActivate', (event, arg) => {
    return postNotification('com.espresso.flow.helper.toggle', {
      penActivate: false
    })
  })

  ipcMain.handle('getPenActions', (event, arg) => {
    const penActions = store.get('penActions')
    if (penActions && Object.keys(penActions).length > 0) {
      for (const action in penActions) {
        postNotification('com.espresso.flow.helper.toggle', {
          stylusAction: {
            type: action,
            action: penActions[action]
          }
        })
      }
    }
    return penActions
  })

  ipcMain.handle('setPenAction', (event, arg) => {
    const penActions = store.get("penActions")
    if (!penActions) {
      store.set('penActions', { [arg.type]: arg.action })
    } else {
      store.set('penActions', {
        ...penActions,
        [arg.type]: arg.action
      })
    }

    return postNotification('com.espresso.flow.helper.toggle', {
      stylusAction: arg
    })
  })

/*
  systemPreferences.subscribeNotification(
    'com.espresso.flow.helper.open-context',
    (event, userInfo) => {
      try {
        //mainWindow.hide()
        const { name, x, y, width, height } = userInfo
        const newCenterLocation = {
          x: Math.floor(
            x +
            width / 2 -
            600 / 2,
          ),
          y: Math.floor(
            y +
            height / 2 -
            600 / 2,
          ),
        };

        if (centerLocation.x !== newCenterLocation.x || centerLocation.y !== newCenterLocation.y) {
          centerLocation = newCenterLocation
          contextWindow.setPosition(centerLocation.x, centerLocation.y);
        }

        if (windowWidth !== width || windowHeight !== height) {
          windowWidth = width
          windowHeight = height
          contextWindow.setSize(
            width,
            height,
          );
        }

        let appContextShortcuts = store.get(`context-${name}`)
        if (!appContextShortcuts) {
          appContextShortcuts = store.get('context-Global')
        }

        contextWindow.show();
        contextWindow.focus();
        //contextWindow.webContents.send('resetFade');
        contextWindow.webContents.send('onPenShortcuts', appContextShortcuts)

      } catch (error) {
        console.log(error);
      }
    },
  );

  systemPreferences.subscribeNotification(
    'com.espresso.flow.helper.close-context',
    async (event, userInfo) => {
      contextWindow.webContents.send('reset-context');
      contextWindow.hide();
    })
  */

  ipcMain.handle("sendContextShortcut", (event, arg) => {
    postNotification('handleShortcut', arg)
    return true
  })

  ipcMain.handle('triggerShortcut', (event, args) => {
    //console.log('shortcut', args)
    try {
      const { name, ...rest } = args
      postNotification('com.espresso.flow.helper.context', { name, contextApp: contextAppName, ...rest })
    } catch (error) {
      console.log(error)
    }

    return true

  });

  ipcMain.handle("closeContext", (event, arg) => {
    // send close context to flow helper
    postNotification('com.espresso.flow.helper.context', { closeContext: true })
    contextWindow.webContents.send('reset-context');
    contextWindow.hide();
    return true
  })

  ipcMain.handle('getPenActivate', (event, arg) => {
    return store.get('penActivate') || false
  })

  systemPreferences.subscribeNotification(
    'com.espresso.flow.helper.penActivate',
    (event, userInfo) => {
      store.set('penActivate', userInfo.penActivate)
      mainWindow.webContents.send('onPenActivate', userInfo);
    },
  );
};

module.exports = { initContextIPC };
