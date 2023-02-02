import { baseImagePath, osFinder } from '../../utils/utility';
import { Link } from 'react-router-dom';
import useStore from '../../store';
import React, { useEffect, useState, useRef } from 'react';
import { swiftKeyCodes } from './swiftKeycodes';
import _ from 'underscore';
import OutsideClickHandler from 'react-outside-click-handler';
import BubbleBox from './BubbleBox';

export const translateToMacCharacters = toSymbols => {
  let translatedSymbols = {
    ArrowLeft: '←',
    ArrowRight: '→',
    ArrowUp: '↑',
    ArrowDown: '↓',
    Ctrl: '⌃',
    Opt: '⌥',
    Cmd: '⌘',
    Shift: '⇧',
    ShiftLeft: '⇧',
    ShiftRight: '⇧',
    Space: '␣',
    Equal: '=',
    Minus: '-',
    BracketRight: ']',
    BracketLeft: '[',
    Backslash: '\\',
    Quote: "'",
    Semicolon: ';',
    Slash: '/',
    Period: '.',
    Comma: ',',
    Backquote: '~',
    IntlBackslash: '`',
    Enter: '↵',
    Tab: '↹',
    Backspace: '⌫',
  };

  let tokens = toSymbols.split('+');
  let edited = [];

  for (let token in tokens) {
    if (translatedSymbols[tokens[token]] !== undefined) {
      edited.push(translatedSymbols[tokens[token]]);
    } else {
      let candidate = tokens[token].replace('Key', '');
      candidate = candidate.replace('Digit', '');
      edited.push(candidate);
    }
  }

  //console.log('edited', edited);
  return edited.join('');
};



const setSnapShortcutSelector = state => state.setSnapShortcut;
const postShortcutSelector = state => state.postSnapShortcut;

const Snap = props => {
  const theme = useStore(state => state.theme);
  const setSnapShortcut = useStore(setSnapShortcutSelector);
  const postShortcut = useStore(postShortcutSelector);
  const flowWindowPermissions = useStore(state => state.flowWindowPermissions);
  const onSnapShortcuts = useStore(state => state.onSnapShortcuts);
  const shortcuts = useStore(state => state.shortcuts);
  const setShortcuts = useStore(state => state.setShortcuts);

  const [bubbleBoxflag, setBubbleBoxflag] = useState(false);
  const [bubbleLocation, setBubbleLocation] = useState(0);
  const [forceBubbleFlag, setforceBubbleFlag] = useState(false)
  const [forceBubbleFlag2, setforceBubbleFlag2] = useState(false)
  const [bubbleActiveOn, setbubbleActiveOn] = useState(null)

  const ref = useRef(null);

  const clearBox = evt => {
    evt.target.value = '';
    postShortcut({ method: 'DISABLE' });
  };

  const clickOff = evt => {
    const id = evt.target.id;
    const value = evt.target.value;

    console.log("Click off in Snap.js", id, value, shortcuts);
    if (!shortcuts) return;
    if (value === '') {
      evt.target.value = shortcuts[id].displayString;
    } else {
      setSnapShortcut({
        action: id,
        modifierFlag: shortcuts[id].modifierFlag,
        keyCode: shortcuts[id].keyCode,
        displayString: shortcuts[id].displayString,
      });
    }

    postShortcut({ method: 'ACTIVATE' });
  };

  const keyPressed = evt => {
    console.log(evt)
    evt.preventDefault();
    evt.target.value = '';

    const action = evt.target.id;

    const validEvent =
      (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey)


    if (!validEvent) {
      //evt.target.value = shortcuts[action].displayString;
      return;
    }

    let modifierFlags = [];

    if (evt.ctrlKey) {
      modifierFlags.push('Ctrl');
    }

    if (evt.altKey) {
      modifierFlags.push('Opt');
    }

    if (evt.metaKey) {
      modifierFlags.push('Cmd');
    }

    if (evt.shiftKey) {
      modifierFlags.push('Shift');
    }

    let keyCode = evt.code;

    if (modifierFlags.length < 1) {
      return;
    }

    //console.log('eventString', eventString);

    // console.log(modifierFlags, keyCode)
    let eventString = [...modifierFlags, keyCode].join('+');
    let displayString = translateToMacCharacters(eventString);

    // check duplicates
    for (let action in shortcuts) {
      if (
        shortcuts[action].displayString === displayString &&
        evt.target.id !== action
      ) {
        return;
      }
    }

    if (keyCode.includes('Key')) {
      keyCode = keyCode.replace('Key', '').toLowerCase();
    } else if (keyCode.includes('Digit')) {
      keyCode = keyCode.replace('Digit', '');
    } else if (keyCode === 'Enter') {
      keyCode = 'returnkey';
    } else if (keyCode.includes('Arrow')) {
      keyCode = keyCode.toLowerCase();
    } else {
      return
    }


    setShortcuts({
      ...shortcuts,
      [action]: {
        keyCode: swiftKeyCodes[keyCode],
        modifierFlag: modifierFlags,
        displayString,
      },
    });

  };

  const handleClickOutside = (event) => {
    if (event.target.id != "bubble1" && event.target.id != "bubble2" && event.target.id != "bubble3") {
      setBubbleBoxflag(false);
    }

  };



  const handleBubbleClick = (event, loc) => {
    if (bubbleBoxflag && (bubbleActiveOn != event.target.id)) {
      setBubbleBoxflag(true)
      setBubbleLocation(loc)
      setbubbleActiveOn(event.target.id)
    }
    else if (bubbleBoxflag && (bubbleActiveOn === event.target.id)) {
      setBubbleBoxflag(false)
    }
    else if (!bubbleBoxflag) {
      setBubbleBoxflag(true)
      setBubbleLocation(loc)
      setbubbleActiveOn(event.target.id)
    }

  }



  useEffect(() => {
    const unsubscribe = onSnapShortcuts();
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    postShortcut({ method: 'GET' });

  }, []);



  return (
    <div
      className="snap_wrapper onboarding-workspace-step3"
      style={{
        opacity: !flowWindowPermissions && osFinder("Mac") ? '50%' : '100%',
        pointerEvents: !flowWindowPermissions && 'none',
      }}
    >
      <div className="snap">
        <div className="snap_row">
          <img src={baseImagePath('icons/snap_left.svg')} alt="snap left" />

          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Left</p>
          </div>
          {osFinder("Mac") ?
            <input
              type="text"
              id="leftHalf"
              name="leftHalf"
              className={theme === 'dark' ? 'dark_box' : 'light_box'}
              value={shortcuts.leftHalf.displayString}
              disabled={false}
              onClick={clearBox}
              onBlur={clickOff}
              onKeyDown={keyPressed}
              onKeyUp={e => {
                e.preventDefault()
                e.stopPropagation()
              }}
            /> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="leftHalf"
                name="leftHalf"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; ←"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div>

        <div className="snap_row">
          <img src={baseImagePath('icons/snap_right.svg')} alt="snap right" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Right</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="rightHalf"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts?.rightHalf.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="rightHalf"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; →"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div>

        <div className="snap_row">
          <img src={baseImagePath(osFinder("Mac") ? 'icons/snap_top.svg' : 'icons/maximise.svg')} alt="snap top" />

          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            {osFinder("Mac") ? <p>Top</p> : <p>Maximise</p>}
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="topHalf"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                disabled={false}
                value={shortcuts?.topHalf.displayString}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="topHalf"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                disabled={true}
                value="&#59266; ↑"
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
          {osFinder("Mac") ? <div></div> :
            <div className="snap_union">
              <OutsideClickHandler
                onOutsideClick={(event) => handleClickOutside(event)
                }
              >
                <img id="bubble1" src={baseImagePath('icons/Union.svg')} alt="snap next" onClick={(event) => handleBubbleClick(event, 1)} />
              </OutsideClickHandler>
            </div>
          }
        </div>

        <div className="snap_row">
          <img src={baseImagePath(osFinder("Mac") ? 'icons/snap_bottom.svg' : 'icons/quarter.svg')} alt="snap bottom" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            {osFinder("Mac") ? <p>Bottom</p> : <p>Quarter</p>}
          </div>

          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="bottomHalf"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts.bottomHalf.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="bottomHalf"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; ↑"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
          {osFinder("Mac") ? <div></div> :
            <div className="snap_union">
              <OutsideClickHandler
                onOutsideClick={(event) => handleClickOutside(event)
                }
              >
                <img id="bubble2" src={baseImagePath('icons/Union.svg')} alt="snap next" onClick={(event) => handleBubbleClick(event, 2)} />
              </OutsideClickHandler>
            </div>
          }

        </div>

        <div className="snap_row">
          <img
            src={baseImagePath(osFinder("Mac") ? 'icons/snap_fullscreen.svg' : 'icons/minimise.svg')}
            alt="snap fullscreen"
          />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            {osFinder("Mac") ? <p>Fullscreen</p> : <p>Minimise</p>}
          </div>

          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="maximize"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts.maximize.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="maximize"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; ↓"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>}
          {osFinder("Mac") ? <div></div> :
            <div className="snap_union">
              <OutsideClickHandler
                onOutsideClick={(event) => handleClickOutside(event)
                }
              >
                <img id="bubble3" src={baseImagePath('icons/Union.svg')} alt="snap next" onClick={(event) => handleBubbleClick(event, 3)} />
              </OutsideClickHandler>
            </div>
          }

        </div>

        <div className="snap_row">
          <img src={baseImagePath('icons/snap_next.svg')} alt="snap next" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Send to next display</p>
          </div>

          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="nextDisplay"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts.nextDisplay.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="nextDisplay"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; ⇧ →"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>}

        </div>

        <div className="snap_row">
          <img src={baseImagePath('icons/snap_prev.svg')} alt="snap previous" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Send to previous display</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="previousDisplay"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts.previousDisplay.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="previousDisplay"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; ⇧ ←"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div>
        
        {osFinder("Mac") ?
        <div className="snap_row">
          <img src={baseImagePath('icons/snap_topLeft.svg')} alt="snap top left" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Top left</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="topLeft"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts?.topLeft?.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="topLeft"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; U"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div> : <div></div>}

        {osFinder("Mac") ?
        <div className="snap_row">
          <img src={baseImagePath('icons/snap_topRight.svg')} alt="snap top right" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Top right</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="topRight"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts?.topRight?.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="topRight"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; I"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div> : <div></div>}

        {osFinder("Mac") ?
        <div className="snap_row">
          <img src={baseImagePath('icons/snap_bottomLeft.svg')} alt="snap bottom left" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Bottom left</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="bottomLeft"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts?.bottomLeft?.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="bottomLeft"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; J"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div> : <div></div>}

        {osFinder("Mac") ?
        <div className="snap_row">
          <img src={baseImagePath('icons/snap_bottomRight.svg')} alt="snap bottom right" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Bottom right</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="bottomRight"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts?.bottomRight?.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="bottomRight"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; K"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div> : <div></div>}

        {osFinder("Mac") ?
        <div className="snap_row">
          <img src={baseImagePath('icons/snap_firstThird.svg')} alt="snap first third" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>First third</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="firstThird"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts?.firstThird?.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="firstThird"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; D"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div> : <div></div>}

        {osFinder("Mac") ?
        <div className="snap_row">
          <img src={baseImagePath('icons/snap_centerThird.svg')} alt="snap center third" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Center third</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="centerThird"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts?.centerThird?.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="centerThird"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; ⇧ ←"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div> : <div></div>}

        {osFinder("Mac") ?
        <div className="snap_row">
          <img src={baseImagePath('icons/snap_lastThird.svg')} alt="snap last third" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Last third</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="lastThird"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts?.lastThird?.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="lastThird"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; ⇧ ←"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div> : <div></div>}

        {osFinder("Mac") ?
        <div className="snap_row">
          <img src={baseImagePath('icons/snap_firstTwoThirds.svg')} alt="snap first two thirds" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>First two thirds</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="firstTwoThirds"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts?.firstTwoThirds?.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="firstTwoThirds"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; ⇧ ←"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div> : <div></div>}

        {osFinder("Mac") ?
        <div className="snap_row">
          <img src={baseImagePath('icons/snap_lastTwoThirds.svg')} alt="snap last two thirds" />
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>Last two thirds</p>
          </div>
          {osFinder("Mac") ?
            <div className="snap_table_box">
              <input
                type="text"
                id="lastTwoThirds"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value={shortcuts?.lastTwoThirds?.displayString}
                disabled={false}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div> :
            <div className="snap_windows_symbol">
              <input
                type="text"
                id="lastTwoThirds"
                className={theme === 'dark' ? 'dark_box' : 'light_box'}
                value="&#59266; ⇧ ←"
                disabled={true}
                onClick={clearBox}
                onBlur={clickOff}
                onKeyDown={keyPressed}
                onKeyUp={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              />
            </div>
          }
        </div>  : <div></div>}

      </div> 



      {/* <div className="snap_row">
          <div className="snap_table_img">
            <img
              src={baseImagePath('icons/snap_mover.svg')}
              alt="snap desktop mover"
            />
          </div>
          <div
            className={
              theme === 'dark' ? 'snap_table_txt_dark' : 'snap_table_txt'
            }
          >
            <p>desktop mover</p>
          </div>
          <div className="snap_table_box">
            <input
              type="textbox"
              id="restore"
              className={theme === 'dark' ? 'dark_box' : 'light_box'}
              value={shortcuts?.restore.displayString}
              onClick={clearBox}
              onBlur={clickOff}
              onKeyDown={keyPressed}
            />
          </div>
        </div> */}
      {/* </div> */}

      <BubbleBox show={bubbleBoxflag} location={bubbleLocation} />
      {osFinder("Mac") ?
        <Link
          to="#"
          style={{
            float: 'right',
            fontSize: '12px',
            marginTop: '15px',
          }}
          className={theme === 'dark' ? 'dark_link' : 'light_link'}
          onClick={() => {
            postShortcut({ method: 'RESET' });
          }}
        >
          Restore defaults
        </Link> : <div></div>}
    </div>
  );
};

export default Snap;
