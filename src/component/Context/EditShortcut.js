import React from 'react';
import { useToasts } from 'react-toast-notifications';
import useStore from '../../store';
import InputWithLabel from '../shared/InputWithLabel';
import ModalTitle from '../shared/ModalTitle';
import { translateToMacCharacters } from '../Window-Management/snap';

const reservedNames = ['select', 'paste', 'redo', 'duplicate', 'pan', 'shift', 'undo', 'copy']

const EditShortcut = () => {
  const { addToast } = useToasts()
  const saveContextShortcut = useStore(state => state.saveContextShortcut);
  const setEditShortcut = useStore(state => state.setEditShortcut);
  const contextShortcut = useStore(state => state.contextShortcut);
  const setContextShortcut = useStore(state => state.setContextShortcut);

  const handleShortcutUpdate = (name, value) => {
    const updatedContextShortcut = {
      ...contextShortcut,
      [name]: value,
    };
    setContextShortcut(updatedContextShortcut);
  };

  const handleSave = () => {
    if (
      contextShortcut.name === '' ||
      contextShortcut.name.trim().length === 0 ||
      typeof contextShortcut.name !== 'string'
    ) {
      addToast("Shortcut name cannot be empty.", {
        appearance: 'error',
        autoDismiss: true,
        id: 'save-shortcut'
      })
      return
    }

    if (contextShortcut.shortcut.displayString === '') {
      addToast("Shortcut key cannot be empty.", {
        appearance: 'error',
        autoDismiss: true,
        id: 'save-shortcut'
      })
      return
    }

    const nameMatch = reservedNames.indexOf(contextShortcut.name)
    if (nameMatch > -1) {
      addToast("Shortcut name is reserved.", {
        appearance: 'error',
        autoDismiss: true,
        id: 'save-shortcut'
      })
      return
    }

    saveContextShortcut(contextShortcut);
  };

  const clearBox = evt => {
    evt.target.value = '';
  };

  const clickOff = evt => {
    const value = evt.target.value;
    if (value === '') {
      evt.target.value = contextShortcut.shortcut.displayString;
    }
  };

  const keyPressed = evt => {
    evt.preventDefault();
    evt.stopPropagation();

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

    let eventString = [...modifierFlags, keyCode].join('+');
    let displayString = translateToMacCharacters(eventString);

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

    handleShortcutUpdate('shortcut', {
      keyCode,
      modifierFlag: modifierFlags,
      displayString,
    });
  };

  return (
    <ModalTitle title="Create shortcut" onClose={() => setEditShortcut(false)}>
      <div className="create-shortcut-container">
        {/* {contextShortcut.icon.icon !== '' ? (
            <div className="icon-placeholder">
              <img
                className="selected-icon"
                src={contextShortcut.icon.icon}
                alt={contextShortcut.icon.name}
              />
            </div>
          ) : (
            <div className="icon-placeholder"></div>
          )} */}

        <InputWithLabel
          name="name"
          placeholder="Name your shortcut"
          value={contextShortcut.name}
          handleChange={e => {
            e.stopPropagation();
            handleShortcutUpdate('name', e.target.value);
          }}
        />

        <label className="input-with-label">
          <input
            type="text"
            name="shortcut"
            value={contextShortcut.shortcut.displayString}
            onClick={clearBox}
            onBlur={clickOff}
            onKeyDown={keyPressed}
            onChange={() => { }}
            placeholder="Enter shortcut"
          />
        </label>
        <div className="btn-container">
          <button
            style={{ marginRight: '1rem' }}
            className="link-button"
            type="button"
            onClick={() => setEditShortcut(false)}
          >
            Cancel
          </button>

          <button className="primary-btn" type="button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
      {/*
      <div className="edit-shortcut-container">
        <div className="shortcuts-selection">
           <div>
            <p
              style={{
                textAlign: 'left',
                fontFamily: 'GTAmerica-Regular',
                fontWeight: 500,
                marginBottom: '1rem',
                marginTop: 0,
              }}
            >
              Choose an icon
            </p>
            <div className="icon-container-grid">
              {[...contextItems].map((item, i) => {
                return (
                  <div
                    key={`shortcut-item-${i}`}
                    onClick={() => handleShortcutUpdate('icon', item.icon)}
                    style={{
                      backgroundColor:
                        contextShortcut.icon.id === item.id && '#C2F056',
                    }}
                  >
                    <img src={item.icon.icon} alt={item.name} />
                  </div>
                );
              })}
            </div>
          </div> 
        </div>
      </div>
      */}
    </ModalTitle>
  );
};

export default EditShortcut;
