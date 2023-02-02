import React, { useState } from 'react';
import useStore from '../../store';
import { baseImagePath, TextTruncate } from '../../utils/utility';

const ShortcutItem = ({
  item,
  i,
  active,
  setActive,
  handleRemove,
  setEditShortcut,
}) => {
  const [editMenu, setEditMenu] = useState(false);
  const setContextShortcut = useStore(state => state.setContextShortcut);

  const handleActive = id => {
    if (i < 8) return
    if (active === '') {
      setActive(id);
    } else {
      setActive('');
    }
  };

  return (
    <div
      className="context-item-container"
      data-id={item.id}
      data-shortcut-id={item.id}
      data-name={item.name}
      data-type="toolbar"
    >
      {item.icon ? (
        <img
          className="context-item-icon"
          src={i < 8 ? baseImagePath(item.icon.icon) : item.icon?.icon}
          alt={item.name}
          style={{
            border: `${item.id === active
              ? '1px solid #C2F056'
              : ' 1px solid transparent'
              }`,
            zIndex: editMenu ? '-1' : '1',
          }}
          onClick={() => handleActive(item.id)}
        />
      ) : (
        <p
          className="context-name"
          style={{
            border: `${item.id === active
              ? '1px solid #C2F056'
              : ' 1px solid transparent'
              }`,
            zIndex: editMenu ? '-1' : '1',
          }}
          onClick={() => handleActive(item.id)}
        >
          {TextTruncate(item.name, 10)}
        </p>
      )}

      {active === item.id && (
        <>
          <div className="context-item-expand">
            <svg
              onClick={() => setEditMenu(!editMenu)}
              xmlns="http://www.w3.org/2000/svg"
              height={15}
              width={15}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </div>
          <div
            className="fixed-modal"
            onClick={() => {
              setEditMenu(false);
              setActive('');
            }}
          ></div>
        </>
      )}

      {editMenu && (
        <>
          <div
            className="fixed-modal"
            onClick={() => {
              setEditMenu(!editMenu);
              setActive('');
            }}
          ></div>
          <div className="edit-options" style={{}}>
            <button
              onClick={() => {
                setContextShortcut(item);
                setEditShortcut(true);
                setEditMenu(!editMenu);
                setActive('');
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height={15}
                width={15}
                style={{ marginRight: '0.25rem' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit
            </button>
            <button
              onClick={() => {
                handleRemove(item.id);
                setEditMenu(!editMenu);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height={15}
                width={15}
                style={{ marginRight: '0.25rem' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShortcutItem;
