import { nanoid } from 'nanoid';
import SNAPPING_WALKTHROUGH, {
  ARRANGEMENT_WALKTHROUGH,
  osFinder,
} from '../utils/utility';
import { findDisplayById } from '../utils/findDisplayById';
import { updateDisplayById } from '../utils/updateDisplayById';
import _ from 'underscore';
import { ARRANGEMENTS } from '../interfaces/arranagement.interface';
import { baseImagePath, generateRandomGradient, generateTransparentColor } from '../utils/utility';
import {
  contextItems,
  emptyContextItems,
} from '../component/Context/ContextShortcuts';

export let appSwapUpdating = false;
export let appSpillUpdating = false;
export let workspaceArranging = false;

export const throttledSetBrightness = _.throttle(
  window.electron.setBrightness,
  500,
);
export const throttledSetContrast = _.throttle(
  window.electron.setContrast,
  500,
);
export const throttledSetVolume = _.throttle(window.electron.setVolume, 500);

export const Actions = (set, get) => ({
  setUser: user => {
    window.electron.getDisplaysInfo();
    set({ user });
  },
  setLogin: data => {
    window.electron.setLogin(data);
    window.electron.startFlowHelper();
  },
  signout: () => {
    set({ user: {} });
    window.electron.signout();
  },
  getTutorialDone: () => {
    const unsubscribe = window.electron.getTutorial(arg => {
      set({ tutorialDone: arg });
    });

    return unsubscribe;
  },
  setVersion: version => {
    set({ version });
  },
  setTheme: theme => {
    set({ theme });
  },
  setSelectedToggle: ({ id, visible }) => {
    set({ selectedToggle: { id, visible } })
  },
  setPermission: permission => {
    set({ permission });
  },
  checkPermissions: () => {
    if (window && window.electron) {
      window.electron.checkPermissions();
    }
  },
  requestPermissions: () => {
    if (window && window.electron) {
      window.electron.requestPermissions();
    }
    set({ cancelPermissions: false });
  },
  pollPermission: () => {
    if (get().permissionInterval || get().permission) return;
    const checkPermissionInterval = setInterval(() => {
      if (!get().permission && !get().cancelPermissions) {
        console.log('helper perm');
        get().checkPermissions();
      } else {
        clearInterval(checkPermissionInterval);
        set({ permissionInterval: 0 });
      }
    }, 1000);
    set({ permissionInterval: checkPermissionInterval });
  },
  setQuitListener: state => {
    set({ quitListener: state });
  },
  setDisplays: displays => {
    let espressoFound = {
      found: false,
      id: null,
    };
    let nonEspressoFound = {
      found: false,
      id: null,
    };
    let espressoV2Found = false;
    for (let i = 0; i < displays.length; i++) {
      if (
        displays[i].type === 'espresso v1' ||
        displays[i].type === 'espresso v2'
      ) {
        espressoFound = {
          found: true,
          id: displays[i].id,
        };
      } else if (displays[i].type === 'non-espresso') {
        nonEspressoFound = {
          found: true,
          id: displays[i].id,
        };
      }

      if (displays[i].type === 'espresso v2') {
        espressoV2Found = true;
      }
    }

    let displayMirrorId = null;

    for (let i = 0; i < displays.length; i++) {
      if (displays[i].is_mirror) {
        displayMirrorId = displays[i].id;
        break;
      }
    }

    if (displayMirrorId) {
      set({
        displays,
        mirrorMode: { id: displayMirrorId, on: true },
        espressoFound,
        nonEspressoFound,
      });
    } else {
      set({ displays, espressoFound, nonEspressoFound, espressoV2Found });
    }
  },
  setDisplayToggled: async data => {
    set({ displayToggled: data });
  },
  setDisplayState: async (id, value) => {
    set({ displayToggled: { id, state: value } });
  },
  setLocation: async values => {
    try {
      if (values.length === 1) return;
      window.electron.setLocation(values);
    } catch (error) {
      console.log(error);
    }
  },
  getDisplaysInfo: async () => {
    if (window && window.electron) {
      window.electron.getDisplaysInfo();
    }
  },
  setMirrorMode: async (id, isMirror) => {
    if (window && window.electron) {
      try {
        await window.electron.setMirrorMode(id, isMirror);
        await window.electron.getDisplaysInfo();
        const displays = updateDisplayById(get, id, { is_mirror: isMirror });
        set({ displays, mirrorMode: { id, on: isMirror } });
      } catch (error) {
        console.log(error);
      }
    }
  },
  setUpdatedFlag: async (value) => {
    set({ updatedFlag: value })
  },
  getUpdatedFlag: async () => {
    window.electron.getUpdatedFlag();
  },
  setLockedRotation: async (windowName, id, is_locked) => {
    if (window.electron) {
      await window.electron.setLockedRotation(windowName, id, is_locked);
      const displays = updateDisplayById(get, id, { is_locked });
      set({ displays });
    }
  },
  setRotateDisplay: async displays => {
    await set({ displays });
  },
  setRotate: async (windowName, id, value) => {
    if (window && window.electron) {
      await window.electron.setLockedRotation(windowName, id, true);
      await window.electron.setRotate(windowName, id, value);

      setTimeout(() => {
        window.electron.requestLocation(id);
        const displays = updateDisplayById(get, id, {
          orientation: value,
          is_locked: true,
        });
        set({ displays });
      }, 700);
    }
  },
  setBrightness: async (windowName, id, value) => {
    if (window && window.electron) {
      get().setBrightnessSync({value: false, window: 'main'});
      const display = findDisplayById(get, id);
      if (display.brightness === value) return;
      await throttledSetBrightness(windowName, id, value);
      const displays = updateDisplayById(get, id, { brightness: value });
      set({ displays });
    }
  },
  setContrast: async (id, value) => {
    if (window && window.electron) {
      const display = findDisplayById(get, id);
      if (display.contrast === value) return;
      await throttledSetContrast(id, value);
      const displays = updateDisplayById(get, id, { contrast: value });
      set({ displays });
    }
  },
  setColourPalette: async (id, value) => {
    if (window && window.electron) {
      try {
        let options = [6, 4, 5, 8, 0];
        const display = findDisplayById(get, id);
        if (display.colour_preset === options[value]) return;
        if (value === undefined) {
          value = 0;
        }

        await window.electron.setColourPreset(id, options[value]);
        const displays = updateDisplayById(get, id, {
          colour_preset: options[value],
        });
        set({ displays });
      } catch (error) {
        console.log(error.message);
      }
    }
  },
  setVolume: async (id, value) => {
    if (window && window.electron) {
      const display = findDisplayById(get, id);
      if (display && display.volume === value) return;
      await throttledSetVolume(id, value);
      const displays = updateDisplayById(get, id, { volume: value });
      set({ displays });
    }
  },
  // setTutorial: async (value) => {

  //   set({
  //     workspaceOnboardingDone: value,
  //   })

  //   if (!value) {
  //     await get().setOnboardingWorkspace(false)
  //   }

  // },
  setTutorialDone: value => {
    window.electron.setTutorialDone();
  },
  setActiveNav: nav => {
    set({ activeNav: nav });
  },
  startFlowHelper: () => {
    if (window && window.electron) {
      window.electron.startFlowHelper();
    }
  },
  quitFlowHelper: () => {
    if (window && window.electron) {
      window.electron.quitFlowHelper();
    }
  },
  updateDisplayFromRotation: async ({
    id,
    orientation,
    resolution,
    location,
  }) => {
    try {
      if (!resolution || !location) {
        return;
      }
      const updatedDisplays = updateDisplayById(get, id, {
        orientation,
        resolution: { x: resolution.x, y: resolution.y },
        location,
      });
      set({ displays: updatedDisplays });
    } catch (error) {
      console.log(error);
    }
  },
  updateSettingValue: ({ setting, id, value }) => {
    if (setting === 'brightnessSync') {
      set({ brightnessSync: value });
    } else if (setting === 'touchEnabled') {
      set({ touchEnabled: value });
    } else {
      const updatedDisplays = updateDisplayById(get, id, { [setting]: value });
      set({ displays: updatedDisplays });
    }
  },
  updateSingleDisplay: (id, settings) => {
    const updatedDisplays = updateDisplayById(get, id, settings);
    set({ displays: updatedDisplays });
  },
  setBrightnessSyncUI: value => {
    set({ brightnessSync: value });
  },
  setBrightnessSync: async data => {
    set({ brightnessSync: data.value });
    await window.electron.setBrightnessSync(data);
  },
  setTouchEnabled: async data => {
    await window.electron.setTouchEnabled(data);
    set({ touchEnabled: data.value });
  },
  setWorkspaceEnabled: async data => {
    if (data !== undefined) {
      await window.electron.setWorkspaceEnabled(data);
      set({ workspaceEnabled: data.value });
    }
  },
  getWorkspaceEnabled: async () => {
    window.electron.getWorkspaceEnabled();
  },
  startFirmwareUpdateTool: () => {
    window.electron.startFirmwareUpdateTool();
  },
  reinitialise: () => {
    window.electron.reinitialise();
  },
  setNewFirmwareFlag: value => {
    window.electron.setFirmwareUpdated(value);
    set({ newFirmwareFlag: value });
  },
  getFirmwareUpdated: async () => {
    const value = await window.electron.getFirmwareUpdated();
    set({ newFirmwareFlag: value });
  },
  setSnapShortcut: data => {
    window.electron.setSnapShortcut(data);
  },
  postSnapShortcut: data => {
    window.electron.postSnapShortcuts(data);
  },
  onSnapShortcuts: () => {
    const unsubscribe = window.electron.snapShortcuts(shortcuts => {
      set({ shortcuts });
    });
    return unsubscribe;
  },
  setShortcuts: updatedShortcuts => {
    set({ shortcuts: updatedShortcuts });
  },
  checkFlowWindowPermissions: () => {
      //if(osFinder('Mac')){
        window.electron.checkFlowWindowPermissions();
     // }      
  },
  checkFlowWindowPermissionsPoll: () => {
    if (get().flowWindowPollInterval || get().flowWindowPermissions) return;

    const checkPermissionInterval = setInterval(() => {
      if (!get().flowWindowPermissions) {
        get().checkFlowWindowPermissions();
      } else {
        clearInterval(checkPermissionInterval);
        set({ flowWindowPollInterval: 0 });
      }
    }, 1000);
    set({ flowWindowPollInterval: checkPermissionInterval });
  },
  onFlowWindowPermissions: () => {

    const unsubscribe = window.electron.onFlowWindowPermissions(value => {
      console.log(value)
      if (value === 1 || value === true) {
        // window.electron.getApps();
        set({ flowWindowPermissions: true });
      }
    });
    return unsubscribe;
  },
  checkConflictingApp: () => {
    window.electron.checkFlowWindowConflictingApp();
  },
  onConflictingApp: () => {
    const unsubscribe = window.electron.onConflictingApp(app => {
      if (app !== '') {
        set({ conflictingAppFlowWindow: app });
      }
    });

    return unsubscribe;
  },
  promptFlowWindowAccessibility: () => {
    const unsubscribe = window.electron.promptFlowWindowAccessibility();
    return unsubscribe;
  },
  setHistory: history => {
    set({ history });
  },
  setWindowTabVisibilityState: isVisible => {
    set({ windowTabVisibilityState: isVisible });
  },
  setWindowTabState: state => {
    set({ windowTabState: state });
  },
  setWorkspaceName: name => {
    if (!get().workspaceSaveButtonVisible) {
      set({ workspaceName: name, workspaceSaveButtonVisible: true });
    } else {
      set({ workspaceName: name });
    }
  },
  setWorkspaceState: state => {
    set({ workspaceState: state });
  },
  setWorkspace: (state, workspace) => {
    try {
      if (state === 'new') {
        const displays = get().displays;
        const displaysWithApps = displays.map(display => {
          return {
            ...display,
            apps: [
              {
                name: '',
                icon: '',
                // action: 'maximize',
                action: 'leftHalf',
              },
            ],
            // arrangement: 'maximize',
            arrangement: 'verticalSplit',
            starred: false,
          };
        });

        set({
          workspaceName: '',
          workspaceDisplays: displaysWithApps,
          savedAppsList: get().appsList,
          workspaceState: state,
          workspaceSaveButtonVisible: true,
          workspace,
        });
      } else {
        set({
          workspaceName: workspace['name'],
          workspaceDisplays: workspace['displays'],
          savedAppsList: get().appsList,
          workspaceState: state,
          workspaceSaveButtonVisible: true,
          workspace,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  setWorkspaceTag: tagName => {
    let tagIndex = get().workspaceTagOptions.findIndex(tag => tag.value === tagName);

    if (tagIndex === -1) {
      tagIndex = null;
    }
    set({ workspaceTag: tagIndex });

    const oldWorkspace = get().workspace;
    const updatedWorkspace = { ...oldWorkspace, tag: tagIndex };
    set({ workspace: updatedWorkspace });
  },
  getWorkspaceTagOptions: async () => {
    const tagOptionsFromStore = await window.electron.getTagOptions();
    if (tagOptionsFromStore === null || tagOptionsFromStore === undefined) return;

    set({ workspaceTagOptions: tagOptionsFromStore });
  },
  setWorkspaceTagOptions: (tagOptions, index) => {
    // console.log("in setWorkspaceTagOptions: ", tagOptions, index);
    if (tagOptions) {
      if (index !== null && index !== undefined && index >= 0) {
        // overwrite object at index passed in the tagOptions array then update array
        const currentTagOptions = get().workspaceTagOptions;
        const updatedTagOptions = [
          ...currentTagOptions.slice(0, index),
          tagOptions,
          ...currentTagOptions.slice(index + 1)
        ];

        set({ workspaceTagOptions: updatedTagOptions });
      }
      else {
        // overwrite entire array
        set({ workspaceTagOptions: tagOptions });
      }

      const newTagOptions = get().workspaceTagOptions;
      // send update to ipc
      window.electron.setTagOptions({ tagOptions: newTagOptions });
    }
    else {
      // if no new options passed in, just save current ones
      const currentTagOptions = get().workspaceTagOptions;
      window.electron.setTagOptions({ tagOptions: currentTagOptions });
    }

  },
  setWorkspaceTagEditPopupVisible: isVisible => {
    set({ workspaceTagEditPopupVisible: isVisible });
  },
  setWorkspaceTagEditPopupPosition: position => {
    set({ workspaceTagEditPopupPosition: position });
  },
  setWorkspaceTagEditCurrentlyEditingIndex: tag => {
    set({ workspaceTagEditCurrentlyEditingIndex: tag });
  },
  updateWorkspaceConfig: data => {
    set({
      workspaceConfig: {
        ...get().workspaceConfig,
        ...data,
      },
    });
  },
  setWorkspaceAppPopupSelectedTab: selectedTab => {
    switch (selectedTab) {
      case 'apps':
        set({
          workspaceAppPopupSelectedTab: 0
        });
        break;
      case 'webpages':
        set({
          workspaceAppPopupSelectedTab: 1
        });
        break;
      default:
        set({
          workspaceAppPopupSelectedTab: 0
        });
        break;
    }
  },
  toggleAppPopupWindow: visible => {
    if (!visible) {
      let selectedApps = [];
      get().appsList.forEach(app => {
        if (app.checked === 'true') {
          selectedApps.push(app.name);
        }
      });

      let selectedContextApps = [];
      get().contextAppsList.forEach(app => {
        if (app.checked === 'true') {
          selectedContextApps.push(app.name);
        }
      });

      window.electron.setSavedApps({
        workspace: selectedApps,
        context: selectedContextApps,
      });
    }
    set({
      workspaceAppPopupVisible: visible,
      selectedContextAppId: 'Global',
      toolTip: { ...get().toolTip, name: 'Global' },
    });
  },
  getWorkspaces: () => {
    window.electron.getWorkspaces();
  },
  returnedWorkspaces: () => {
    const unsubscribe = window.electron.returnedWorkspaces(workspaces => {
      set({ workspaces });
    });

    return unsubscribe;
  },
  updateWorkspace: (id, value) => {
    // console.log('updateWorkspace');
    const workspaces = get().workspaces;
    const workspaceIndex = workspaces.findIndex(ws => ws.id === id);
    if (workspaceIndex === -1) return;
    const updatedWorkspace = {
      ...workspaces[workspaceIndex],
      ...value,
    };
    const updatedWorkspaces = [
      ...workspaces.slice(0, workspaceIndex),
      updatedWorkspace,
      ...workspaces.slice(workspaceIndex + 1),
    ];

    set({ workspaces: updatedWorkspaces });
  },
  getApps: () => {
    if (get().appsList.length === 0) {
      window.electron.getApps();
    }
  },
  returnedApps: () => {
    const unsubscribe = window.electron.returnedApps(apps => {
      set({ appsList: apps.workspace, contextAppsList: apps.context });
    });
    return unsubscribe;
  },
  setWorkspaceSaveState: value => {
    set({ workspaceSaveState: value });
  },
  saveWorkspace: () => {
    const workspace = get().workspace;
    const workspaceName = get().workspaceName;
    const workspaceDisplays = get().workspaceDisplays;
    const id = workspace.id ? workspace.id : nanoid();
    let workspaceTagObject = null;
    if (workspace.tag !== null) {
      workspaceTagObject = get().workspaceTagOptions[workspace.tag];
    }

    const newWorkspace = {
      id,
      name: workspaceName,
      displays: workspaceDisplays,
      gradient: workspaceTagObject ? generateTransparentColor(workspaceTagObject.backgroundColor, '0.6')
        : 'rgba(255,255,255,0.6)',
      tag: workspace.tag,
    };

    window.electron.saveWorkspace(newWorkspace);
  },
  onSavedWorkspace: addToast => {
    window.electron.savedWorkspace(workspace => {
      if (typeof workspace === 'string') {
        console.log('error', workspace);
        set({ workspaceSaveState: false });
        return;
      }

      const workspaces = get().workspaces;
      // console.log(workspaces, workspace);
      const workspaceIndex = workspaces.findIndex(ws => ws.id === workspace.id);

      let updatedWorkspaces = workspaces;
      if (workspaceIndex > -1) {
        updatedWorkspaces = [
          ...workspaces.slice(0, workspaceIndex),
          workspace,
          ...workspaces.slice(workspaceIndex + 1),
        ];
      } else {
        updatedWorkspaces.push(workspace);
      }

      set({
        workspace,
        workspaces: updatedWorkspaces,
        workspaceSaveState: false,
        workspaceState: 'list',
      });
    });
  },
  deleteWorkspace: id => {
    window.electron.deleteWorkspace(id);
  },
  onDeletedWorkspace: addToast => {
    const unsubscribe = window.electron.onDeletedWorkspace(id => {
      if (typeof id !== 'string') {
        addToast(id.error, {
          appearance: 'error',
          autoDismiss: true,
          id: 'delete-workspace-error',
        });
      } else {
        const workspaces = get().workspaces;
        const newWorkspaces = workspaces.filter(ws => ws.id !== id);
        set({ workspaces: newWorkspaces });
      }
    });
    return unsubscribe;
  },
  setWorkspaceArrangement: workspace => {
    if (workspaceArranging) return;
    if (!get().flowWindowPermissions && osFinder('Mac')) {
      set({
        workspaceActivating: {
          id: '',
          loading: false,
        },
      });
      return;
    }

    workspaceArranging = true;
    window.electron.setWorkspaceArrangement(workspace);
  },
  onWorkspaceDone: (addToast, setWorkspaceActivating, setModal) => {
    const unsubscribe = window.electron.onWorkspaceDone(message => {
      console.log(message);
      /* if (message === 'Workspace set successfully.') {
        addToast(message, {
          appearance: 'success',
          autoDismiss: true,
          id: 'workspace-set',
        });
      } else if (message) {
        addToast(message, {
          appearance: 'error',
          autoDismiss: true,
          id: 'workspace-set',
        });
      } */

      setWorkspaceActivating({ id: null, loading: false });
      setModal(false);

      workspaceArranging = false;
      if (get().startWorkspaceWalkthrough) {
        get().setWorkspaceOnboardingStep(SNAPPING_WALKTHROUGH.FINISH);
      }
    });

    return unsubscribe;
  },
  updateSavedApps: (appName, checked) => {
    const savedAppsList = get().appsList;
    const index = savedAppsList.findIndex(app => app.name === appName);
    if (index === -1) return;
    const updatedApp = { ...savedAppsList[index], checked };
    const newUpdatedApps = [
      ...savedAppsList.slice(0, index),
      updatedApp,
      ...savedAppsList.slice(index + 1),
    ];

    set({ appsList: newUpdatedApps });
  },
  updateContextApps: (appName, checked) => {
    const savedAppsList = get().contextAppsList;
    const index = savedAppsList.findIndex(app => app.name === appName);
    if (index === -1) return;
    const updatedApp = { ...savedAppsList[index], checked };
    const newUpdatedApps = [
      ...savedAppsList.slice(0, index),
      updatedApp,
      ...savedAppsList.slice(index + 1),
    ];

    set({
      contextAppsList: newUpdatedApps,
      selectedContextShortcuts: contextItems,
      //selectedContextAppId: "Global",
      //tooltip: { ...get().tooltip, name: "Global", visible: true }
    });

    // save context apps to electron store

    //get().toggleAppPopupWindow(false)
  },
  setWorkspaceDisplays: workspaceDisplays => {
    set({ workspaceDisplays: workspaceDisplays });
  },
  updateWorkspaceDisplays: (id, value, rotation) => {
    // console.log("in Actions->updateWorkspaceDisplays(): ", id, value, rotation);
    const workspaceDisplays = get().workspaceDisplays;
    const index = get().workspaceDisplays.findIndex(
      display => display.id === id,
    );
    if (index === -1) return;

    const currentWorkspaceDisplay = workspaceDisplays[index];
    const valueObject = Object.entries(value);

    let currentApps = currentWorkspaceDisplay.apps;
    let updatedApps;

    if (valueObject[0][0] === 'arrangement') {
      const numOfApps = currentApps.length;
      let maxApps = 1;
      switch (valueObject[0][1]) {
        case ARRANGEMENTS.MAXIMIZE:
          maxApps = 1;
          break;
        case ARRANGEMENTS.VERTICALSPLIT:
          maxApps = 2;
          break;
        case ARRANGEMENTS.HORIZONTALSPLIT:
          maxApps = 2;
          break;
        default:
          break;
      }

      if (numOfApps < maxApps) {
        for (let i = 0; i < maxApps - numOfApps; i++) {
          currentApps.push({
            name: '',
            icon: '',
            action: '',
          });
        }
      } else if (numOfApps > maxApps) {
        currentApps = currentApps.slice(0, maxApps);
      }

      updatedApps = currentApps.map((app, i) => {
        let action = '';
        switch (valueObject[0][1]) {
          case ARRANGEMENTS.MAXIMIZE:
            action = 'maximize';
            break;
          case ARRANGEMENTS.VERTICALSPLIT:
            if (i === 0) {
              if (rotation === 90 || rotation === 180) {
                action = 'rightHalf';
              } else {
                action = 'leftHalf';
              }
            } else {
              if (rotation === 90 || rotation === 180) {
                action = 'leftHalf';
              } else {
                action = 'rightHalf';
              }
            }

            break;
          case ARRANGEMENTS.HORIZONTALSPLIT:
            if (i === 0) {
              if (rotation === 270 || rotation === 180) {
                action = 'bottomHalf';
              } else {
                action = 'topHalf';
              }
            } else {
              if (rotation === 270 || rotation === 180) {
                action = 'leftHalf';
              } else {
                action = 'bottomHalf';
              }
            }
            break;
          default:
            break;
        }

        return {
          ...app,
          action: action,
        };
      });
    }

    const selectedWorkspaceDisplay = {
      ...workspaceDisplays[index],
      ...value,
      apps: updatedApps,
    };

    const newWorkspaceDisplays = [
      ...workspaceDisplays.slice(0, index),
      selectedWorkspaceDisplay,
      ...workspaceDisplays.slice(index + 1),
    ];

    set({ workspaceDisplays: newWorkspaceDisplays });
  },
  updateWorkSpaceApp: (id, newApp, slotIndex) => {
    try {
      const workspaceDisplays = get().workspaceDisplays;
      const index = get().workspaceDisplays.findIndex(
        display => display.id === id,
      );
      if (index === -1) return;

      const appsList = workspaceDisplays[index].apps;

      let newAppList = [];

      const appToUpdate =
        newApp.length === 0
          ? [{ name: '', icon: '', action: 'leftHalf' }]
          : newApp;

      newAppList = [
        ...appsList.slice(0, slotIndex),
        ...appToUpdate,
        ...appsList.slice(slotIndex + 1),
      ];

      const selectedWorkspaceDisplay = {
        ...workspaceDisplays[index],
        apps: newAppList,
      };

      const newWorkspaceDisplays = [
        ...workspaceDisplays.slice(0, index),
        selectedWorkspaceDisplay,
        ...workspaceDisplays.slice(index + 1),
      ];

      set({ workspaceDisplays: newWorkspaceDisplays });
    } catch (error) {
      console.log(error);
    }
  },
  addWorkSpaceApp: (
    id,
    appName,
    slotIndex,
    originalIndex,
    arrangement,
    type,
    rotation,
  ) => {
    try {
      if (appSwapUpdating) return;
      if (appSpillUpdating) return;

      appSwapUpdating = true;
      const workspaceDisplays = get().workspaceDisplays;
      const index = get().workspaceDisplays.findIndex(
        display => display.id === id,
      );
      if (index === -1) {
        appSwapUpdating = false;
        return;
      }

      let existingAppIndex = -1;

      for (let workspace of workspaceDisplays) {
        const apps = workspace.apps;
        existingAppIndex = apps.findIndex(app => app.name === appName);
        if (existingAppIndex > -1) break;
      }

      if (
        existingAppIndex > -1 &&
        type === 'toolbar' &&
        appName !== 'Safari' &&
        appName !== 'Google Chrome' &&
        appName !== 'Brave Browser' &&
        appName !== 'Firefox'
      ) {
        appSwapUpdating = false;
        return;
      }

      const appsList = workspaceDisplays[index].apps;
      let newAppList = appsList;
      const combinedAppList = [...get().appsList, ...get().webpagesList];
      const newAppIndex = combinedAppList.findIndex(
        app => app.name === appName,
      );

      const newApp = combinedAppList[newAppIndex];
      const oldApp = appsList[slotIndex];

      // determine action based on arrangement

      let action = 'maximize';
      switch (arrangement) {
        case ARRANGEMENTS.MAXIMIZE:
          action = 'maximize';
          break;
        case ARRANGEMENTS.VERTICALSPLIT:
          if (slotIndex === 0) {
            if (rotation === 90 || rotation === 180) {
              action = 'rightHalf';
            } else {
              action = 'leftHalf';
            }
          } else {
            if (rotation === 90 || rotation === 180) {
              action = 'leftHalf';
            } else {
              action = 'rightHalf';
            }
          }
          break;
        case ARRANGEMENTS.HORIZONTALSPLIT:
          if (slotIndex === 0) {
            if (rotation === 270 || rotation === 180) {
              action = 'bottomHalf';
            } else {
              action = 'topHalf';
            }
          } else {
            if (rotation === 270 || rotation === 180) {
              action = 'topHalf';
            } else {
              action = 'bottomHalf';
            }
          }
          break;
        default:
          break;
      }
      // console.log("action: ", action);
      // console.log("type: ", type);

      if (type === 'toolbar') {
        newAppList = [
          ...appsList.slice(0, slotIndex),
          { ...newApp, action: action },
          ...appsList.slice(slotIndex + 1),
        ];
      } else {
        if (type === 'remove') {
          const previousOldApp = get().workspaceOldApp;
          newAppList[slotIndex] = previousOldApp;
        } else {
          newAppList = [
            ...appsList.slice(0, slotIndex),
            newApp,
            ...appsList.slice(slotIndex + 1),
          ];

          newAppList[slotIndex] = newApp;
          newAppList[originalIndex] = oldApp;

          let actions = [];

          switch (arrangement) {
            case ARRANGEMENTS.MAXIMIZE:
              actions.push('maximize');
              break;
            case ARRANGEMENTS.VERTICALSPLIT:
              if (rotation === 0 || rotation === 270) {
                actions = ['leftHalf', 'rightHalf'];
              } else {
                actions = ['rightHalf', 'leftHalf'];
              }
              break;
            case ARRANGEMENTS.HORIZONTALSPLIT:
              if (rotation === 0 || rotation === 90) {
                actions = ['topHalf', 'bottomHalf'];
              } else {
                actions = ['bottomHalf', 'topHalf'];
              }
              break;
            default:
              break;
          }

          newAppList = newAppList.map((app, i) => {
            return {
              ...app,
              action: actions[i],
            };
          });
          // console.log(
          //   '🚀 ~ file: Actions.js ~ line 876 ~ newAppList.forEach ~ newAppList',
          //   newAppList,
          // );
        }
      }


      const selectedWorkspaceDisplay = {
        ...workspaceDisplays[index],
        apps: [...newAppList],
      };

      const newWorkspaceDisplays = [
        ...workspaceDisplays.slice(0, index),
        selectedWorkspaceDisplay,
        ...workspaceDisplays.slice(index + 1),
      ];

      if (get().startWorkspaceWalkthrough) {
        set({
          workspaceDisplays: newWorkspaceDisplays,
          workspaceOnboardingStep: 10,
          displayToggled: { id, state: true },
        });
      } else {
        set({
          workspaceDisplays: newWorkspaceDisplays,
          displayToggled: { id, state: true },
        });
      }

      appSwapUpdating = false;
    } catch (error) {
      console.log(error);
    }
  },
  removeAppFromWorkspace: (id, appName, slotIndex) => {
    // console.log("removing app");
    appSpillUpdating = true;
    if (appSwapUpdating) return;
    //if (appName === '') return;

    const workspaceDisplays = get().workspaceDisplays;
    const index = get().workspaceDisplays.findIndex(
      display => display.id === id,
    );
    if (index === -1) return;

    const appsList = workspaceDisplays[index].apps;

    /*    const newAppsList = [
      ...appsList.slice(0, slotIndex),
      { name: '', icon: '' },
      ...appsList.slice(slotIndex+1)
    ] */

    appsList[slotIndex] = { name: '', icon: '', action: '' };

    // console.log(appsList);

    const selectedWorkspaceDisplay = {
      ...workspaceDisplays[index],
      apps: appsList,
    };

    const newWorkspaceDisplays = [
      ...workspaceDisplays.slice(0, index),
      selectedWorkspaceDisplay,
      ...workspaceDisplays.slice(index + 1),
    ];

    set({ workspaceDisplays: newWorkspaceDisplays });
    appSpillUpdating = false;
  },
  updateWebpagesList: webpageData => {
    const webpagesList = get().webpagesList;
    const webpagesIndex = webpagesList.findIndex(
      page => page.id === webpageData.id,
    );
    if (webpagesIndex > -1) {
      const updatedWebpagesList = [
        ...webpagesList.slice(0, webpagesIndex),
        webpageData,
        ...webpagesList.slice(webpagesIndex + 1),
      ];
      set({ webpagesList: updatedWebpagesList });
    } else {
      set({ webpagesList: [...webpagesList, webpageData] });
    }
  },
  getWebpages: async () => {
    try {
      const result = await window.electron.getWebPages();
      set({ webpagesList: result });
    } catch (error) {
      console.log(error);
    }
  },
  saveWebpages: async webpageData => {
    try {
      const id = webpageData.id !== null ? webpageData.id : nanoid();
      const result = await window.electron.saveWebpages({
        ...webpageData,
        id,
      });

      if (result) {
        get().updateWebpagesList({ ...webpageData, id });
        const workspaces = get().workspaces;
        const updatedWorkspaces = workspaces.map(ws => {
          let displays = [];
          for (const display of ws.displays) {
            let apps = [];
            for (const app of display.apps) {
              if (app.id === id) {
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
            ...ws,
            displays,
          };
        });
        set({ workspaces: updatedWorkspaces });
      } else {
        throw new Error('Pages unable to be saved.');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },
  removeWebpage: async id => {
    try {
      const result = await window.electron.removeWebpage(id);
      if (result) {
        const updatedWebpagesList = get().webpagesList.filter(
          page => page.id !== id,
        );
        set({ webpagesList: updatedWebpagesList });
      } else {
        throw new Error('Cannot delete page group');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },
  startFlowWindow: () => {
    window.electron.startFlowWindow();
  },
  setAppDragOn: value => {
    set({ appDragOn: value });
  },
  setToolbarAppCount: length => {
    set({ toolbarAppCount: length });
  },
  setToolTip: value => {
    set({
      toolTip: {
        ...get().toolTip,
        ...value,
      },
    });
  },
  setPenActivated: value => {
    set({ penActivated: value });
  },
  setWorkspaceEditMode: toggle => {
    set({ workspaceEditMode: toggle });
  },
  setWorkspaceActivating: value => {
    set({ workspaceActivating: value });
  },
  setEditShortcut: value => {
    set({ editShortcut: value });
  },
  getContextShortcuts: async () => {
    try {
      const result = await window.electron.getContextShortcuts();
      if (result) {
        set({ contextShortcuts: result });
      }
    } catch (error) {
      console.log(error);
    }
  },
  setContextShortcut: value => {
    set({
      contextShortcut: value,
    });
  },
  deleteContextShortcut: async id => {
    try {
      const result = await window.electron.deleteContextShortcut(id);
      set({ contextShortcuts: result });
    } catch (error) {
      console.log(error);
    }
  },
  saveContextShortcut: async contextShortcut => {
    try {
      const result = await window.electron.saveContextShortcut(contextShortcut);
      set({
        contextShortcuts: result,
        editShortcut: false,
      });
    } catch (error) {
      console.log(error);
    }
  },
  setAppContextShortcuts: async appName => {
    try {
      const result = await window.electron.getAppContextShortcuts(appName);
      if (result.length === 0) {
        set({
          selectedContextShortcuts:
            appName === 'Global' ? contextItems : emptyContextItems,
          selectedContextAppId: appName,
        });
      } else {
        set({
          selectedContextShortcuts: result,
          selectedContextAppId: appName,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  saveAppContextShortcuts: async contextShortcuts => {
    const result = await window.electron.saveAppContextShortcuts(
      get().selectedContextAppId,
      contextShortcuts,
    );
    return result;
  },
  addContextShortcut: (shortcutId, appName, slotIndex, originalIndex, type) => {
    try {
      if (appSwapUpdating) return;
      if (appSpillUpdating) return;
      appSwapUpdating = true;

      const contextShortcuts = [...contextItems, ...get().contextShortcuts];

      const shortcutMatch = contextShortcuts.findIndex(
        shortcut => shortcut.id === shortcutId,
      );

      if (shortcutMatch === -1) {
        appSwapUpdating = false;
        return;
      }

      let selectedContextShortcuts = get().selectedContextShortcuts;

      if (type === 'toolbar') {
        selectedContextShortcuts = [
          ...selectedContextShortcuts.slice(0, slotIndex),
          contextShortcuts[shortcutMatch],
          ...selectedContextShortcuts.slice(slotIndex + 1),
        ];
      } else {
        const newApp = contextShortcuts[shortcutMatch];
        const oldApp = selectedContextShortcuts[slotIndex];

        selectedContextShortcuts[slotIndex] = newApp;
        selectedContextShortcuts[originalIndex] = oldApp;

        set({ selectedContextShortcuts });
        get().saveAppContextShortcuts(selectedContextShortcuts);
        appSwapUpdating = false;
        return;
      }

      set({ selectedContextShortcuts });
      get().saveAppContextShortcuts(selectedContextShortcuts);

      appSwapUpdating = false;
    } catch (error) {
      console.log(error);
    }
  },
  removeContextShortcut: slotIndex => {
    appSpillUpdating = true;
    if (appSwapUpdating) return;
    let selectedContextShortcuts = get().selectedContextShortcuts;

    selectedContextShortcuts = [
      ...selectedContextShortcuts.slice(0, slotIndex),
      {
        id: nanoid(),
        name: 'add',
        shortcut: {
          keyCode: '',
          modifierFlag: [],
          displayString: 'Add Shortcut',
        },
        icon: {
          id: nanoid(),
          icon: baseImagePath('icons/add.svg'),
        },
      },
      ...selectedContextShortcuts.slice(slotIndex + 1),
    ];

    set({ selectedContextShortcuts });
    get().saveAppContextShortcuts(selectedContextShortcuts);

    appSpillUpdating = false;
  },
  getPenActivate: async () => {
    const result = await window.electron.getPenActivate();
    set({ penActivated: result });
  },
  penActivate: () => {
    window.electron.penActivate();
  },
  onPenActivate: () => {
    return window.electron.onPenActivate(arg => {
      set({ penActivated: arg.penActivate });
    });
  },
  getPenActions: async () => {
    const penActions = await window.electron.getPenActions();
    set({
      penActions: penActions || {
        barrel: 'system',
        eraser: 'none',
      },
    });
  },
  setPenAction: async data => {
    await window.electron.setPenAction(data);
  },
  onPenShortcuts: () => {
    return window.electron.onPenShortcuts(shortcuts => {
      set({ selectedContextShortcuts: shortcuts || contextItems });
    });
  },
  restartFlow: () => {
    window.electron.restartFlow();
  },
  setWorkspaceOnboardingRun: value => {
    set({ workspaceOnboardingRun: value });
  },
  setWorkspaceOnboardingStep: step => {
    set({ workspaceOnboardingStep: step });
  },
  setWorkspaceOnboardingModal: value => {
    set({ workspaceOnboardingModal: value });
  },
  setWorkspaceContainerRef: value => {
    set({ workspaceContainerRef: value });
  },
  setEspressoSetup: value => {
    set({ espressoSetup: value });
  },
  setOnboarding: value => {
    const updatedOnboarding = {
      ...get().onboarding,
      ...value,
    };
    set({
      onboarding: updatedOnboarding,
    });
  },
  saveOnboarding: onboarding => {
    // console.log(onboarding);
    set({
      onboarding,
      menuVisible: onboarding.initial,
      activeNav: '/screen-three',
      startDisplayWalkthrough: false,
      startWorkspaceWalkthrough: false,
    });
    window.electron.setOnboarding(onboarding);
  },
  setMenuVisible: value => {
    set({ menuVisible: value });
  },
  setDisplayOnboardingStep: value => {
    set({ displayOnboardingStep: value });
  },
  endDisplayOnboarding: () => {
    const onboarding = get().onboarding;
    const updatedOnboarding = {
      ...onboarding,
      initial: true,
      display: true,
    };

    set({
      onboarding: updatedOnboarding,
      displayOnboardingStep: ARRANGEMENT_WALKTHROUGH.START,
      startDisplayWalkthrough: false,
      startSidebarWalkthrough: false,
    });

    window.electron.setOnboarding(updatedOnboarding);
  },
  endWorkspaceOnboarding: () => {
    const onboarding = get().onboarding;
    const updatedOnboarding = {
      ...onboarding,
      initial: true,
      workspace: true,
    };

    set({
      onboarding: updatedOnboarding,
      workspaceOnboardingStep: SNAPPING_WALKTHROUGH.START,
      startWorkspaceWalkthrough: false,
      startSidebarWalkthrough: false,
    });

    window.electron.setOnboarding(updatedOnboarding);
  },
  getOnboarding: async () => {
    const onboarding = await window.electron.getOnboarding();
    // console.log(
    //   '🚀 ~ file: Actions.js ~ line 1328 ~ getOnboarding: ~ onboarding',
    //   onboarding,
    // );

    set({ onboarding });
  },
  setSidebarWalkthrough: value => {
    set({ startSidebarWalkthrough: value });
  },
  setDisplayWalkthrough: value => {
    set({ startDisplayWalkthrough: value });
  },
  setWorkspaceWalkthrough: value => {
    set({ startWorkspaceWalkthrough: value });
  },
  setShowNoEspressoModal: value => {
    set({ showNoEspressoModal: value });
  },
});
