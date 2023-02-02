const flowlib = require('./flowlibwin.node');
const { displayType } = require('./utils');
const { screen } = require('electron');
const find = require('find-process');
const {
  exec,
  execFile,
  execFileSync,
  execSync,
  spawn,
} = require('child_process');
const { Console } = require('console');

const { trackEvent, getCurrentTimeStamp } = require("./analytics")

const displayIds = flowlib.getDisplayIds();

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

const flowwin = () => {
  let displays_list = [];
  let brightness = 0;

  const _getDisplaysInfo = () => {
    const displayIds = flowlib.getDisplayIds();
    let displaysList = displayIds.map(id => {
      const name = flowlib.getDisplayName(id);
      const electronId = flowlib.getDisplayHashId(id);
      const type = displayType(name);
      const location = flowlib.getDisplayLocation(id);
      const orientation = flowlib.getDisplayOrientation(id);
      const resolution = flowlib.getDisplayResolution(id);
      const workingArea = flowlib.getDisplayWorkingArea(id);
      const is_main = flowlib.getIsMainDisplayId(id) === 1 ? true : false;
      const is_mirror = flowlib.getDisplayMirrorState(id) === 0 ? false : true;
      const brightness =
        type === 'espresso v2' || type === 'espresso v1'
          ? getDdcValue('brightness', id)
          : 0;
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
        electronId,
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
        working_area: {
          left: workingArea.left,
          top: workingArea.top,
          right: workingArea.right,
          bottom: workingArea.bottom,
        },
        is_main,
        is_mirror,
        brightness,
        contrast,
        colour_preset,
        volume,
        is_locked,
        ddc_enabled,
      };
    });
    displays_list = displaysList;

    let mirrored_loc = [];
    let mirrored_num = 0;
    for (let i = 0; i < displays_list.length; i++) {
      if (displays_list[i].is_mirror) {
        mirrored_loc.push(i);
        mirrored_num++;
      }
      for (let i = 0; i < mirrored_loc.length - 1; i++) {
        mirrored_loc.splice(i, 1);
        displays_list.splice(i, 1);
      }
    }
    //console.log(displays_list);
    return displaysList;
  };

  const getDisplaysTray = () => {
    return _getDisplaysInfo()
  }

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

  const getDdcValues = id => {
    const brightness = getDdcValue('brightness', id);
    const contrast = getDdcValue('contrast', id);
    const colour_preset = getDdcValue('colorpreset', id);
    const display = displays_list.find(_display => _display.id === id);
    let volume = 0;
    if (display && display.type === 'espresso v2') {
      volume = getDdcValue('volume', id);
    }
    updateDisplayById(displays_list, id, {
      brightness,
      contrast,
      colour_preset,
      volume,
    });

    return {
      brightness,
      contrast,
      colour_preset,
      volume,
    };
  };

  const getDisplaysInfo = () => {
    if (displays_list.length > 0) return displays_list;
    return _getDisplaysInfo();
  };

  const getBrightness = id => {
    let value = flowlib.getBrightness(id);
    return value;
    // updateDisplayById(displays_list, id, {brightness: value})
  };

  const setBrightness = (id, value) => {
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

  const setRotate = (id, value) => {
    const displayIndex = displays_list.findIndex(d => d.id === id);

    flowlib.setOrientation(id, value);

    const location = flowlib.getDisplayLocation(id);
    const resX = displays_list[displayIndex].resolution.x;
    const resY = displays_list[displayIndex].resolution.y;
    let resolution = {
      x: resX,
      y: resY,
    };
    if (value === 90 || value == 270) {
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
      flowlib.setLocation(values);
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
      console.log(error.message);
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

    const reinitialise_displays = async action => {
      stop_rotation_listeners();
      if (action === 'display-added') {
        await sleep(3000);
      } else {
        await sleep(3000);
      }
      let displays = _getDisplaysInfo();


      displays_list = displays;
      mainWindow.webContents.send('displays', displays);
      //trayWindow.webContents.send('displays', displays);
      rotation_update(displays);
    };

    screen.on('display-added', (e, display) => {
      reinitialise_displays('display-added');
    });

    screen.on('display-removed', (e, _display) => {
      reinitialise_displays('display-added');
    });

    const getRotate = display => {
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

        if (previous_rotation !== rotation && !is_locked && rotation !== null) {
          let value = rotation
          if(rotation === 0 || rotation === null || rotation === undefined){
            value = 0;
          }
          trackEvent("Auto-Rotate", {Orientation: value, Stamp: getCurrentTimeStamp() })
          console.log("rotating ", value)
          
          setRotate(display.id, rotation);

          const displayIndex = displays_list.findIndex(
            d => d.id === display.id,
          );
          if (displayIndex === -1) return;

          const location = flowlib.getDisplayLocation(display.id);
          const resolution = displays_list[displayIndex].resolution;

          mainWindow.webContents.send('rotationChanged', {
            id: display.id,
            orientation: rotation,
            location,
            resolution,
          });
          
          // trayWindow.webContents.send('rotationChanged', {
          //   id: display.id,
          //   orientation: rotation,
          // });

          updateDisplayById(displays_list, display.id, {
            orientation: rotation,
          });
          updateDisplayById(displays_list, display.id, { is_locked: false });
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    const rotation_update = displays => {
      for (const d of displays) {
        if (d.type === 'espresso v2') {
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

    let prev_physical_displays;
    let prev_mirrored_displays;
    let mirrored_displays_num = 0;

    const getPhysicalNum = () => {
      let filteredIdList = [];
      let physical_displays = flowlib.getDisplayIds();
      let physical_displays_num = physical_displays.length;

      for (const e of physical_displays) {
        const filteredId = e.split('\\Monitor');
        filteredIdList.push(filteredId[0]);
      }
      const mirrored_count = {};
      filteredIdList.forEach(element => {
        mirrored_count[element] = (mirrored_count[element] || 0) + 1;
      });

      for (const m of Object.keys(mirrored_count)) {
        if (mirrored_count[m] > 1) {
          mirrored_displays_num = mirrored_count[m];
          break;
        } else {
          mirrored_displays_num = 0;
        }
      }

      if (
        mirrored_displays_num < prev_mirrored_displays &&
        physical_displays_num < prev_physical_displays
      ) {
        reinitialise_displays('display-removed');
      } else if (
        mirrored_displays_num > prev_mirrored_displays &&
        physical_displays_num > prev_physical_displays
      ) {
        reinitialise_displays('display-added');
      }

      prev_physical_displays = physical_displays_num;
      prev_mirrored_displays = mirrored_displays_num;
    };

    const physical_monitor_listener = () => {
      let physical_monitor_thread = setInterval(() => getPhysicalNum(), 2000);
    };

    physical_monitor_listener();

    return {
      rotation_update: () => rotation_update(displays_list),
      stop_rotation_listeners,
      reinitialise_displays
    };
  };

  const quitFlowHelper = async () => {
    const processList = await find('name', 'Espresso Flow Helper');
    if (processList && processList.length > 0) {
      processList.map(_process => process.kill(_process.pid));
    }
  };

  let exePath = `${__dirname}/Espresso Flow Helper.app`;

  const checkPermissions = async () => {
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

  const startFlowHelper = async () => {
    try {
      await quitFlowHelper();
      spawn(exePath);
    } catch (error) {
      console.log(error.message);
    }
  };

  return {
    getDdcValue,
    getDisplaysInfo,
    getDisplaysTray,
    getBrightness,
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
    quitApps: () => {}
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
  flowwin,
};
