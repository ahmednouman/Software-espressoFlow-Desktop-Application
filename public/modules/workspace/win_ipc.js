const { ipcMain } = require('electron');
const { store } = require('../store.js');
const flowlib = require('../flowlibwin.node');
const { extractIcon } = require('exe-icon-extractor');
const sizeOf = require('buffer-image-size');
const { v4: uuidv4 } = require('uuid');
// const { getAllInstalledSoftwareSync, fromDir } = require('./win_reg_app')
const { trackEvent,  getCurrentTimeStamp } = require('../analytics.js');
const {GlobalKeyboardListener} = require("node-global-key-listener");
const v = new GlobalKeyboardListener();

try{
v.addListener(function (e, down) {
  // console.log(
  //     `${e.name} ${e.state == "DOWN" ? "DOWN" : "UP  "} [${e.rawKey._nameRaw}]`
  // );
  if (e.name == "LEFT ARROW" && e.state == "DOWN" && down["LEFT META"] && !down["LEFT SHIFT"]){
     trackEvent('snap', {action:"LEFT",  Stamp: getCurrentTimeStamp()});
  }
  else if (e.name == "RIGHT ARROW" && e.state == "DOWN" && down["LEFT META"] && !down["LEFT SHIFT"]){
    trackEvent('snap', {action:"RIGHT",  Stamp: getCurrentTimeStamp()});
  }
  else if (e.name == "UP ARROW" && e.state == "DOWN" && down["LEFT META"] && !down["LEFT SHIFT"]){
    trackEvent('snap', {action:"UP",  Stamp: getCurrentTimeStamp()});
  }
  else if (e.name == "DOWN ARROW" && e.state == "DOWN" && down["LEFT META"] && !down["LEFT SHIFT"]){
    trackEvent('snap', {action:"DOWN",  Stamp: getCurrentTimeStamp()});
  }
  else if (e.name == "LEFT ARROW" && e.state == "DOWN" && down["LEFT META"] && down["LEFT SHIFT"]){
    trackEvent('snap', {action:"SEND-TO-NEXT-DISPLAY",  Stamp: getCurrentTimeStamp()});
 }
 else if (e.name == "RIGHT ARROW" && e.state == "DOWN" && down["LEFT META"] && down["LEFT SHIFT"]){
  trackEvent('snap', {action:"SEND-TO-NEXT-DISPLAY",  Stamp: getCurrentTimeStamp()});
}
});

  calledOnce = function (e) {
  // console.log("only called once");
    v.removeListener(calledOnce);
  };
  v.addListener(calledOnce);
}catch(er){
  console.log(er)
}

let getApps = function () {
  try{
    let filteredAppList = [];
 
    let appList = flowlib.getAllApps();

  for (const app of appList) {
    try {
      const buffer = extractIcon(app, 'large');
      const dimensions = sizeOf(buffer);
      let encoded_icon = Buffer.from(buffer).toString('base64');
      let start = app.lastIndexOf('\\');
      let end = app.lastIndexOf('.exe');
      if (end === -1) {
        end = app.lastIndexOf('.EXE');
      }
      let name = app.substring(start + 1, end);
      let item = {
        id: uuidv4(),
        name: name,
        url: app,
        icon: 'data:image/png;base64,' + encoded_icon,
      };
      filteredAppList.push(item);
    } catch (error) {
      console.error(error)
    }
  }
  console.log("apps count", filteredAppList.length)
  store.set('allApps', filteredAppList);
  return filteredAppList;
  }catch(err){
    console.log(err)
  }
};

function setNumofApps(num) {
  flowlib.numOfAppstoLaunch(num);
}

function launchApplication(display_id, pos, path) {
  flowlib.launchApp(display_id, pos, path);
}

function launchWebBrowser(display_id, pos, urls) {
  flowlib.launchWebBrowser(display_id, pos, urls);
}

const initWorkspaceIPCWin = (flowlib, mainWindow) => {
  try{

    ipcMain.on('setWorkspaceArrangement', async (event, arg) => {
      let appsInDisplay = null;
      let numOfApps = 0;
      for (let i = 0; i < arg.displays.length; i++) {
        appsInDisplay = arg.displays[i].apps;
        for (let k = 0; k < appsInDisplay.length; k++) {
          if (appsInDisplay[k].name != '') {
            numOfApps = numOfApps + 1;
          }
        }
      }

      setNumofApps(numOfApps);
      for (let i = 0; i < arg.displays.length; i++) {
        appsInDisplay = arg.displays[i].apps;
        for (let j = 0; j < appsInDisplay.length; j++) {
          let pos = null;
          if (appsInDisplay[j].action === 'leftHalf') {
            pos = 0;
          } else if (appsInDisplay[j].action === 'rightHalf') {
            pos = 1;
          } else if (appsInDisplay[j].action === 'topHalf') {
            pos = 2;
          } else if (appsInDisplay[j].action === 'bottomHalf') {
            pos = 3;
          } else if (appsInDisplay[j].action === 'maximize') {
            pos = 4;
          }
          if (appsInDisplay[j].name != '') {
            if (appsInDisplay[j].hasOwnProperty('urls')) {
              launchWebBrowser(arg.displays[i].id, pos, appsInDisplay[j].urls);
            } else {
              console.log(appsInDisplay[j].url);
              launchApplication(arg.displays[i].id, pos, appsInDisplay[j].url);
            }
          }
        }
      }
      /*
        for(let i = 0; i < arg.displays.length; i++){
          appsInDisplay = arg.displays[i].apps
          let browserAppIndex = null;
          for(let k=0; k < appsInDisplay.length; k++){
            if(appsInDisplay[k].hasOwnProperty("urls"))
            browserAppIndex = k
            break;
          }
          for(let j=0; j < appsInDisplay.length; j++){
            if (browserAppIndex !== null){
              let pos = null;
              if(appsInDisplay[browserAppIndex].action === "leftHalf"){
                pos = 0;
              }else if(appsInDisplay[browserAppIndex].action === "rightHalf"){
                pos = 1;
              }else if(appsInDisplay[browserAppIndex].action === "topHalf"){
                pos = 2;
              }else if(appsInDisplay[browserAppIndex].action === "bottomHalf"){
                pos = 3;
              }else if(appsInDisplay[browserAppIndex].action === "maximize"){
                pos = 4;
              }     
              launchWebBrowser(arg.displays[i].id, pos, appsInDisplay[browserAppIndex].urls)
              browserAppIndex = null;

            }
            if(appsInDisplay[j].hasOwnProperty("url")){
              let pos = null;
              if(appsInDisplay[j].action === "leftHalf"){
                pos = 0;
              }else if(appsInDisplay[j].action === "rightHalf"){
                pos = 1;
              }else if(appsInDisplay[j].action === "topHalf"){
                pos = 2;
              }else if(appsInDisplay[j].action === "bottomHalf"){
                pos = 3;
              }else if(appsInDisplay[j].action === "maximize"){
                pos = 4;
              }
              console.log(appsInDisplay[j].url)
              console.log(appsInDisplay[j].action)
              launchApplication(arg.displays[i].id, pos, appsInDisplay[j].url)
            }
            else if(appsInDisplay[j].hasOwnProperty("urls") && j !== browserAppIndex ){

            }
          }
        }
        */
      mainWindow.webContents.send(
        'workspaceDone',
        'Espresso workspace launcher is not running.',
      );
    });

    ipcMain.on('getApps', (event, arg) => {
      const savedApps = store.get('savedApps') || [];
      let allApps = getApps();
      store.set('allApps', allApps);

      let found = false;
      let newAppsList = [];

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
      });

      //console.log(newAppsList)
      mainWindow.webContents.send('returnedApps', {
        workspace: newAppsList,
        context: [],
      });
    });

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
          trackEvent('workspace', { create: workspace.id, Stamp: getCurrentTimeStamp() });
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
            trackEvent('workspace', { edit: workspace.id, Stamp: getCurrentTimeStamp() });
          } else {
            store.set('workspaces', [...workspacesStore, workspace]);
            trackEvent('workspace', { create: workspace.id, Stamp: getCurrentTimeStamp() });
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
    trackEvent('Catch-Error', { Source: "win_ipc", Stamp: getCurrentTimeStamp() });
  }
};

module.exports = { initWorkspaceIPCWin };
