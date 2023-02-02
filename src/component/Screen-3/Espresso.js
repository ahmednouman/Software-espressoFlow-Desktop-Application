/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import Block from '../shared/Block';
import RotateBlock from './RotateBlock';
import Slider from 'react-rangeslider';
import Picture from './Picture';
import 'react-rangeslider/lib/index.css';
import { baseImagePath, TextTruncate } from '../../utils/utility';
import useStore from '../../store/index';

const displaysSelector = state => state.displays;
const setBrightnessSelector = state => state.setBrightness;
const setVolumeSelector = state => state.setVolume;
const setLockedRotationSelector = state => state.setLockedRotation;
const setRotateSelector = state => state.setRotate;
const displayToggledSelector = state => state.displayToggled;
const setDisplayToggledSelector = state => state.setDisplayToggled;
const setDisplayStateSelector = state => state.setDisplayState;
const setMirrorModeSelector = state => state.setMirrorMode;

const Espresso = ({
  setRotateDislay,
  item,
  isPause,
  setIsPause,
  isDraging,
}) => {
  const menuRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const theme = useStore(state => state.theme);
  const displays = useStore(displaysSelector);
  const setBrightnessAPI = useStore(setBrightnessSelector);
  const setVolumeAPI = useStore(setVolumeSelector);
  const setLockedRotation = useStore(setLockedRotationSelector);
  const setRotateAPI = useStore(setRotateSelector);
  const displayToggled = useStore(displayToggledSelector);
  const setDisplayToggled = useStore(setDisplayToggledSelector);
  const setDisplayState = useStore(setDisplayStateSelector);
  const setMirrorMode = useStore(setMirrorModeSelector);
  const espressoFound = useStore(state => state.espressoFound)
  const nonEspressoFound = useStore(state => state.nonEspressoFound)
  const displayOnboardingStep = useStore(state => state.displayOnboardingStep)


  let storeDisplayIndex = displays.findIndex(display => display.id === item.id);
  let storeDisplay = null;
  if (storeDisplayIndex > -1) {
    storeDisplay = displays[storeDisplayIndex];
  }

  const getDegreeTranslate = display => {
    if (display.degree === 90) return '25%,50%';
    if (display.degree === 270) return '-25%,-50%';

    return '0%,0%';
  };

  const defaultDisplay = {
    left: 0,
    right: 90,
    inverted: 180,
    normal: 270,
    degree: 0,
  };

  const [displaySetting, setDisplaySetting] = useState(defaultDisplay);
  const [display, setDisplay] = useState(false);
  const [, setIsLocked] = useState(item.is_locked);
  const [rotateBlockToggle, setRotateBlockToggle] = useState(false);
  const [pictureToggle, setPictureToggle] = useState(false);
  const [, setIsMirror] = useState(item.is_mirror);

  const toggle = () => {
    if (!isOpen) {
      window.electron.getDdcValues(item.id, item.type);
    }
    setIsOpen(!isOpen);
    setPictureToggle(false);
    setRotateBlockToggle(false);
  };

  let brightnessValue = 0;
  if (storeDisplay !== undefined && storeDisplay !== null) {
    brightnessValue = storeDisplay.brightness;
  }

  useEffect(() => {
    if (storeDisplay) {
      let name;
      if (storeDisplay.orientation === 0) name = 'normal';
      if (storeDisplay.orientation === 90) name = 'right';
      if (storeDisplay.orientation === 180) name = 'inverted';
      if (storeDisplay.orientation === 270) name = 'left';

      setDisplaySetting({
        ...displaySetting,
        [name]: true,
        degree: storeDisplay.orientation,
      });
    }

    return () => { };
  }, [storeDisplay]);

  useEffect(() => {
    if (displays.length > 0) {
      setDisplay(false);
      setDisplayState(item.id);
    }

    if ((displayOnboardingStep === 1 && espressoFound.found && espressoFound.id === item.id) || (displayOnboardingStep === 2 && nonEspressoFound.found && nonEspressoFound.id === item.id)) {
      handleDisplay()
    }

  }, [displays.length, espressoFound, displayOnboardingStep]);

  useEffect(() => {
    if (displayOnboardingStep === 2 && item.type !== "non-espresso") {
      setDisplay(!display);
      setIsPause(true)
    } else if (displayOnboardingStep === 0) {
      setIsPause(false)
    }
  }, [displayOnboardingStep])

  const handleBrightness = async value => {
    await setBrightnessAPI('main', item.id, value);
  };

  const handleVolume = async value => {
    await setVolumeAPI(item.id, value);
  };

  const setRotate = async (name, degree) => {
    setIsLocked(true);
    for (const property in displaySetting) {
      if (property === name) displaySetting[property] = true;
      else displaySetting[property] = false;
    }
    setDisplaySetting({ ...displaySetting, degree });
    setIsPause(false);
    await setRotateAPI('main', item.id, degree);
    setRotateDislay(degree, item);
  };

  const handleDisplay = () => {
    if (isDraging) {
      setDisplayToggled(item.id, !displayToggled.state);
      setDisplay(!display);
      setIsPause(!isPause);
    }
  };


  const handleMirror = (id, value) => {
    setMirrorMode(id, value)
    setDisplay(false)
  }

  const listenForOutsideClicks = (
    listening,
    setListening,
    menuRef,
    setIsOpen,
  ) => {
    return () => {
      if (listening) return;
      if (!menuRef.current) return;
      setListening(true);
      [`click`, `touchstart`].forEach(type => {
        document.addEventListener(`click`, evt => {
          if (menuRef.current && menuRef.current.contains(evt.target)) return;
          setIsOpen(false);
          setPictureToggle(false);
          setRotateBlockToggle(false);
          setDisplayState(item.id);
        });
      });
    };
  };

  useEffect(() => {
    if (!isOpen) {
      setDisplay(false);
      setIsPause(false);
    }
  }, [isOpen]);

  useEffect(
    listenForOutsideClicks(listening, setListening, menuRef, setIsOpen),
  );

  const padingSpace = 4;
  const screenStyle = {
    width: [90, 270].includes(item.orientation)
      ? item.height - padingSpace
      : item.width - padingSpace,
    height: [90, 270].includes(item.orientation)
      ? item.width - padingSpace
      : item.height - padingSpace,
  };

  const updateLocked = () => {
    setIsLocked(!item.is_locked);
    setLockedRotation('main', item.id, !item.is_locked);
  };

  return (
    <>
      <div
        className={`es_func_device_img ${isPause && !display ? 'es_device_box_opacity_img' : ''
          } espresso-${1}`}
        style={{ height: '100%' }}
        ref={menuRef}
      >
        <div
          className={`es_device_box unselectable`}
          style={{ height: '100%' }}
        >
          <span
            className="cursor-pointer"
            onClick={() => {
              handleDisplay();
              toggle();
            }}
            style={{ height: '100%' }}
          >
            <span
              style={{ height: '100%', position: 'relative' }}
              className={`screen-span ${display ? 'active' : ''}`}
            >
              {item.type === 'non-espresso' &&
                [null, false].includes(item.is_mirror) ? (
                <div
                  className={
                    theme === 'light'
                      ? 'non-espresso-screen'
                      : 'non-espresso-screen-dark'
                  }
                  style={{
                    transform: `rotate(${displaySetting.degree
                      }deg) translate(${getDegreeTranslate(displaySetting)})`,
                    ...screenStyle,
                  }}
                ></div>
              ) : (
                ''
              )}


              {item.type !== 'non-espresso' &&
                [null, false].includes(item.is_mirror) && (
                  <div
                    className={
                      theme === 'light'
                        ? 'espresso-screen'
                        : 'espresso-screen border-white'
                    }
                    style={{
                      transform: `rotate(${displaySetting.degree
                        }deg) translate(${getDegreeTranslate(displaySetting)})`,
                      ...screenStyle,
                    }}
                  >
                    <div
                      className={
                        theme === 'light'
                          ? 'espresso-top-box'
                          : 'espresso-top-box-dark'
                      }
                    >
                      <img
                        src={
                          theme === 'light'
                            ? baseImagePath('icons/dc.svg')
                            : baseImagePath('icons/favicon16-white.svg')
                        }
                        alt="thumbnails-img"
                      />
                    </div>
                  </div>
                )}
            </span>
            <p
              className={`es_monitor_name_id ${display ? 'es_desplay_id' : ''
                } ${displaySetting.degree === 90 ? 'es_down_display_id' : ''} ${displaySetting.degree === 270 ? 'es_up_display_id' : ''
                }`}
            >
              {item.is_main ? (
                <img src={baseImagePath('icons/tick.svg')} alt="tick" />
              ) : (
                ''
              )}{' '}
              {item.name ? item.name : TextTruncate(item.id, 12)}
            </p>
          </span>
          <div
            className={`es_device_setting_wrap ${display ? 'device_setting_show' : ''
              }`}
          >
            <div className="es_device_top_section">
              <div className="es_device_setting_left" style={{ position: 'absolute', top: '-40px' }}>
                {!item.is_main ? (
                  <>
                    <Block
                      url="icons/mirror.svg"
                      activeUrl="icons/mirror-dark.svg"
                      text="Mirror"
                      activeText="Mirror On"
                      click={() => handleMirror(item.id, !item.is_mirror)}
                      active={item.is_mirror}
                      setActive={setIsMirror}
                    />
                  </>
                ): ''}
              </div>
              <div className="es_device_setting_left">
                {!item.is_main || item.is_mirror ? <></> : ''}
                {item.type === 'espresso v2' && !item.is_mirror && (
                  <>
                    <Block
                      url="icons/lock.svg"
                      activeUrl="icons/lock-dark.svg"
                      text="Lock rotation"
                      activeText="Locked"
                      click={updateLocked}
                      active={item.is_locked}
                      setActive={setIsLocked}
                    />
                  </>
                )}
              </div>
              {!item.is_mirror && (
                <div className="es_device_setting_right">
                  <RotateBlock
                    isLocked={item.is_locked}
                    displaySetting={displaySetting}
                    setDisplay={setRotate}
                    rotateBlockToggle={rotateBlockToggle}
                    setRotateBlockToggle={setRotateBlockToggle}
                    setPictureToggle={setPictureToggle}
                  />
                </div>
              )}
            </div>
            <div className="es_device_setting_bottom">
              {item.type !== 'non-espresso' && item.ddc_enabled ? (
                <span className="es_dv_set_ft_brightness_dynamic cursor-pointer">
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={brightnessValue}
                    tooltip={false}
                    orientation="vertical"
                    onChange={e => handleBrightness(e)}
                  />
                  <img
                    src={baseImagePath(
                      brightnessValue > 50
                        ? 'icons/brightness-dark.svg'
                        : 'icons/brightness.svg',
                    )}
                    className="pointer-events"
                    alt="brightness slider"
                  />
                </span>
              ) : (
                ''
              )}
              {(item.type === 'espresso v2' || item.type === 'espresso v1') &&
                item.name !== 'eD13(2022)' &&
                item.ddc_enabled ? (
                <span className="es_dv_set_ft_brightness_dynamic cursor-pointer">
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={item.volume}
                    tooltip={false}
                    orientation="vertical"
                    onChange={e => handleVolume(e)}
                  />
                  <img
                    src={baseImagePath(
                      item.volume > 50
                        ? 'icons/volume-dark.svg'
                        : 'icons/volume-light.svg',
                    )}
                    className="pointer-events"
                    alt="mirror-img"
                  />
                </span>
              ) : (
                ''
              )}
              {item.type !== 'non-espresso' && item.type !== 'espresso v1' ? (
                <div className="pictureParent">
                  <Picture
                    display={item}
                    pictureToggle={pictureToggle}
                    setPictureToggle={setPictureToggle}
                    setRotateBlockToggle={setRotateBlockToggle}
                  />
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
      {/* )} */}
    </>
  );
};

export default Espresso;
