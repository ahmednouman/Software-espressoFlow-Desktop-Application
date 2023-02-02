const flowlib = require('./flowlibmac.node');
const isDev = require('electron-is-dev');
const { displayType } = require('./utils');
const { screen, powerMonitor } = require('electron');
const find = require('find-process');
const { exec } = require('child_process');
var path = require('path');
const { trackEvent, getCurrentTimeStamp } = require('./analytics');

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function _sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}

const flowmac = () => {
  let displays_list = [];

  const _getDisplaysInfo = () => {
    const displayIds = flowlib.getDisplayIds();

    let displaysList = displayIds.map(id => {
      const name = flowlib.getDisplayName(id);
      const type = displayType(name);
      const location = flowlib.getDisplayLocation(id);
      const orientation = flowlib.getDisplayOrientation(id);
      const resolution = flowlib.getDisplayResolution(id);
      const is_main = flowlib.getIsMainDisplayId(id) === 1 ? true : false;
      const is_mirror = flowlib.getDisplayMirrorState(id) === 0 ? false : true;
      const brightness =
        type === 'espresso v2' || type === 'espresso v1'
          ? getDdcValue('brightness', id)
          : 0;
      const autobrightness = true;
      const contrast =
        type === 'espresso v2' || type === 'espresso v1'
          ? getDdcValue('contrast', id)
          : 0;
      const colour_preset =
        type === 'espresso v2' ? getDdcValue('colorpreset', id) : 0;
      const volume = type === 'espresso v2' ? getDdcValue('volume', id) : 0;
      const is_locked = false;
      const ddc_enabled =
        ((type === 'espresso v2' || type === 'espresso v1') &&
          typeof brightness === 'number' &&
          brightness > 0) ||
        false;
      return {
        id,
        name,
        type,
        location: {
          x: location.x,
          y: location.y,
        },
        orientation,
        resolution: {
          x: resolution.x,
          y: resolution.y,
        },
        is_main,
        is_mirror,
        brightness,
        contrast,
        colour_preset,
        volume,
        is_locked,
        ddc_enabled,
        autobrightness,
      };
    });
    displays_list = displaysList;
    return displaysList;
  };

  const getDdcValue = (setting, id) => {
    let ddcValue = 0;
    var start = new Date().getTime();
    while (new Date().getTime() - start < 200) {
      let value = undefined;
      switch (setting) {
        case 'brightness':
          value = flowlib.getBrightness(id);
          break;
        case 'contrast':
          value = flowlib.getContrast(id);
          break;
        case 'colorpreset':
          value = flowlib.getColourPreset(id);
          break;
        case 'volume':
          value = flowlib.getVolume(id);
          break;
        default:
          break;
      }

      if (value !== undefined) {
        ddcValue = value;
        break;
      }
    }
    return ddcValue;
  };

  const getDisplaysInfo = () => {
    if (displays_list.length > 0) return displays_list;
    return _getDisplaysInfo();
  };

  const getDisplaysTray = () => {
    return _getDisplaysInfo();
  };

  const setBrightness = (id, value) => {
    console.log(id);
    flowlib.setBrightness(id, value);
    updateDisplayById(displays_list, id, { brightness: value });
  };

  const setContrast = (id, value) => {
    flowlib.setContrast(id, value);
    updateDisplayById(displays_list, id, { contrast: value });
  };

  const setVolume = (id, value) => {
    flowlib.setVolume(id, value);
    updateDisplayById(displays_list, id, { volume: value });
  };

  const setColourPreset = (id, value) => {
    flowlib.setColourPreset(id, value);
    updateDisplayById(displays_list, id, { colour_preset: value });
  };

  const setLockedRotation = (id, value) => {
    updateDisplayById(displays_list, id, { is_locked: value });
  };

  const setRotate = async (id, value) => {
    try {
      const displayIndex = displays_list.findIndex(d => d.id === id);

      flowlib.setOrientation(id, value);

      const location = flowlib.getDisplayLocation(id);
      const resX = displays_list[displayIndex].resolution.x;
      const resY = displays_list[displayIndex].resolution.y;
      let resolution = {
        x: resX,
        y: resY,
      };
      if (value === 90 || value === 270) {
        resolution = {
          x: resX >= resY ? resY : resX,
          y: resX >= resY ? resX : resY,
        };
      } else {
        resolution = {
          x: resX >= resY ? resX : resY,
          y: resX >= resY ? resY : resX,
        };
      }

      updateDisplayById(displays_list, id, {
        orientation: value,
        location,
        resolution,
      });
    } catch (error) {
      console.log('line 190', error);
    }
  };

  const setMirrorMode = (id, value) => {
    flowlib.setMirrorMode(id, value);
    if (value) {
      updateDisplayById(displays_list, id, {
        is_mirror: value,
        location: { x: 0, y: 0 },
      });
    } else {
      const displayIds = flowlib.getDisplayIds();
      displayIds.map(id => {
        const location = flowlib.getDisplayLocation(id);
        updateDisplayById(displays_list, id, {
          is_mirror: value,
          location: { x: location.x, y: location.y },
        });
      });
    }
  };

  const setLocation = values => {
    try {
      const roundedValues = values.map(val => {
        return {
          ...val,
          x: parseInt(val.x, 10),
          y: parseInt(val.y, 10),
        };
      });
      flowlib.setLocation(roundedValues);
      _sleep(500);
      displays_list = displays_list.map(display => {
        const location = flowlib.getDisplayLocation(display.id);
        return {
          ...display,
          location: {
            x: location.x,
            y: location.y,
          },
        };
      });
    } catch (error) {
      console.log('line 235', error.message);
    }
  };

  const getLocation = id => {
    try {
      const location = flowlib.getDisplayLocation(id);
      return location;
    } catch (error) {
      console.log(error);
    }
  };

  const deviceListener = (mainWindow, trayWindow) => {
    let rotation_listeners = {};

    powerMonitor.on('suspend', () => {
      stop_rotation_listeners();
    });

    powerMonitor.on('resume', () => {
      reinitialise_displays();
    });

    const reinitialise_displays = async () => {
      stop_rotation_listeners();
      await sleep(5000);
      let displays = _getDisplaysInfo();
      displays_list = displays;
      mainWindow.webContents.send('displays', displays);
      rotation_update(displays);
    };

    const brightnessSync = value => {
      stop_rotation_listeners();
      displays_list.forEach(display => {
        display.autobrightness = value;
      });
      rotation_update(displays_list);
    };

    screen.on('display-added', (e, display) => {
      reinitialise_displays();
    });

    screen.on('display-removed', (e, display) => {
      reinitialise_displays();
    });

    const getRotate = display => {
      if (display.autobrightness) {
        flowlib.synchroniseBrightness(display.id);
      } else {
      }
      if (display.type === 'espresso v2') {
        try {
          const ddc_rotation = flowlib.getRotation(display.id);

          let rotation = null;
          switch (ddc_rotation) {
            case 1:
              rotation = 0;
              break;
            case 2:
              rotation = 90;
              break;
            case 3:
              rotation = 180;
              break;
            case 4:
              rotation = 270;
              break;
            default:
              break;
          }

          const previous_rotation = getDisplayPropById(
            displays_list,
            display.id,
            'orientation',
          );
          const is_locked = getDisplayPropById(
            displays_list,
            display.id,
            'is_locked',
          );

          const is_mirror = getDisplayPropById(
            displays_list,
            display.id,
            'is_mirror',
          );

          if (is_mirror) return;

          if (
            previous_rotation !== rotation &&
            !is_locked &&
            rotation !== null &&
            !is_mirror
          ) {
            console.log('auto-rotate triggered rotation = ', rotation);
            trackEvent('Auto-Rotate', { Orientation: rotation, Stamp: getCurrentTimeStamp() });
            setRotate(display.id, rotation);

            const displayIndex = displays_list.findIndex(
              d => d.id === display.id,
            );
            if (displayIndex === -1) return;

            const location = flowlib.getDisplayLocation(display.id);
            const resolution = displays_list[displayIndex].resolution;

            updateDisplayById(displays_list, display.id, {
              orientation: rotation,
            });

            mainWindow.webContents.send('rotationChanged', {
              id: display.id,
              orientation: rotation,
              resolution,
              location,
            });

            trayWindow.webContents.send('rotationChanged', {
              id: display.id,
              orientation: rotation,
              resolution,
              location,
            });
          }

          const location = flowlib.getDisplayLocation(display.id);
          const currentLocation = getDisplayPropById(
            displays_list,
            display.id,
            'location',
          );

          if (
            location !== undefined &&
            location !== null &&
            location.x !== currentLocation.x &&
            location.y !== currentLocation.y
          ) {
            updateDisplayById(displays_list, display.id, {
              location,
            });
            mainWindow.webContents.send('location', {
              id: display.id,
              location,
            });
          }
        } catch (error) {
          console.log('line 396', error.message);
        }
      }
    };

    const rotation_update = displays => {
      for (const d of displays) {
        if (
          (d.type === 'espresso v2' || d.type === 'espresso v1') &&
          d.is_mirror === false
        ) {
          rotation_listeners[d.id] = setInterval(() => getRotate(d), 2000);
        }
      }
    };

    const stop_rotation_listeners = () => {
      for (const e of Object.keys(rotation_listeners)) {
        clearInterval(rotation_listeners[e]);
      }
      rotation_listeners = {};
    };

    rotation_update(displays_list);

    return {
      rotation_update: () => rotation_update(displays_list),
      stop_rotation_listeners,
      brightnessSync,
      reinitialise_displays,
    };
  };

  const quitApps = async apps => {
    for (let i = 0; i < apps.length; i++) {
      try {
        const processList = await find('name', apps[i].name);
        if (processList && processList.length > 0) {
          processList.map(_process => process.kill(_process.pid));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const quitFlowHelper = async () => {
    const processList = await find('name', 'Espresso Flow Helper');
    if (processList && processList.length > 0) {
      processList.map(_process => process.kill(_process.pid));
    }
  };

  let exePath = isDev
    ? path.join(__dirname, '../../src/assets/Espresso Flow Helper.app')
    : path.join(process.resourcesPath, 'assets/Espresso Flow Helper.app');

  const checkPermissions = async () => {
    try {
      await quitFlowHelper();

      exec(
        `/usr/bin/open -n '${exePath}' --args -c`,
        function (err, stdout, stderr) {
          if (err) {
            console.error(err);
            return;
          }
          console.log(stdout);
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const requestPermissions = async () => {
    try {
      await quitFlowHelper();
      exec(
        `/usr/bin/open -n '${exePath}' --args -r`,
        function (err, stdout, stderr) {
          if (err) {
            console.error(err);
            return;
          }
          console.log(stdout);
        },
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  const quitFlowWindow = async () => {
    const processList = await find('name', 'Espresso Flow Window');
    if (processList && processList.length > 0) {
      for (let i = processList.length - 1; i >= 0; i--) {
        process.kill(processList[i].pid);
      }
    }
  };

  const startFlowWindow = async () => {
    try {
      let execPath = isDev
        ? path.join(__dirname, '../../src/assets/Espresso Flow Window.app')
        : path.join(process.resourcesPath, 'assets/Espresso Flow Window.app');

      exec(`/usr/bin/open -n '${execPath}'`, function (err, stdout, stderr) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
      });
    } catch (error) {
      console.log(error);
    }
  };
  const startFlowHelper = async () => {
    try {
      // await quitFlowHelper()
      // let execPath = isDev
      //   ? path.join(__dirname, '../../src/assets/Espresso Flow Helper.app')
      //   : path.join(process.resourcesPath, 'assets/Espresso Flow Helper.app');
      console.log('start flow helper');
      exec(`/usr/bin/open -n '${exePath}'`, function (err, stdout, stderr) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const startFirmwareUpdateTool = async () => {
    try {
      let execPath = isDev
        ? path.join(
            __dirname,
            '../../src/assets/espressoFirmwareUpdateTool.app',
          )
        : path.join(
            process.resourcesPath,
            'assets/espressoFirmwareUpdateTool.app',
          );

      exec(`/usr/bin/open -n '${execPath}'`, function (err, stdout, stderr) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
      });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    getDdcValue,
    _getDisplaysInfo,
    getDisplaysInfo,
    getDisplaysTray,
    setBrightness,
    setContrast,
    setVolume,
    setColourPreset,
    setLockedRotation,
    setRotate,
    setMirrorMode,
    getLocation,
    deviceListener,
    setLocation,
    checkPermissions,
    requestPermissions,
    startFlowHelper,
    quitFlowHelper,
    startFlowWindow,
    startFirmwareUpdateTool,
    quitFlowWindow,
    quitApps: () =>
      quitApps([
        { name: 'Espresso Flow Helper' },
        { name: 'Espresso Flow Window' },
        { name: 'Espresso Flow WindowLauncher' },
      ]),
  };
};

const updateDisplayById = (displays_list, id, value) => {
  const displayIndex = displays_list.findIndex(d => d.id === id);
  if (displayIndex > -1) {
    displays_list[displayIndex] = {
      ...displays_list[displayIndex],
      ...value,
    };
  }
};

const getDisplayPropById = (displays_list, id, prop) => {
  const displayIndex = displays_list.findIndex(d => d.id === id);
  if (displayIndex > -1) {
    return displays_list[displayIndex][prop];
  }
  return null;
};

module.exports = {
  flowmac,
};
