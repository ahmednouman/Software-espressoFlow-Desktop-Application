import React, { useState } from 'react';
import useStore from '../../store';
import { baseImagePath } from '../../utils/utility';
import EditShortcut from './EditShortcut';
import ShortcutsList from './ShortcutsList';
import Modal from '../shared/Modal';
import { nanoid } from 'nanoid';

const Shortcuts = () => {
  const editShortcut = useStore(state => state.editShortcut);
  const setEditShortcut = useStore(state => state.setEditShortcut);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const setContextShortcut = useStore(state => state.setContextShortcut);

  return (
    <>
      <div className="context-menu-shortcuts-container">
        <div className="shortcuts-header">
          <h5>{editShortcut ? 'Create a shortcut' : 'Shortcuts'}</h5>
        </div>

        <ShortcutsList
          setEditShortcut={setEditShortcut}
          groupName="shortcuts"
        />

        {editShortcut && <EditShortcut />}

        {!editShortcut && (
          <div className="footer">
            <img
              src={baseImagePath('icons/add.svg')}
              alt="add"
              onClick={() => {
                setContextShortcut({
                  id: nanoid(),
                  name: '',
                  shortcut: {
                    keyCode: '',
                    modifierFlag: '',
                    displayString: '',
                  },
                });
                setEditShortcut(!editShortcut);
              }}
            />
          </div>
        )}
      </div>
      {deleteModalVisible && (
        <Modal
          title=""
          onClose={() => setDeleteModalVisible(!deleteModalVisible)}
        >
          <div className="workspace-activate-modal-body">
            <div>
              <p>Would you like to delete this shortcut?</p>
            </div>

            <div>
              <button
                className="modal-body-no-btn"
                type="button"
                onClick={() => setDeleteModalVisible(!deleteModalVisible)}
              >
                No
              </button>
              <button
                className="modal-body-yes-btn"
                type="button"
                onClick={() => {}}
              >
                Yes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Shortcuts;
