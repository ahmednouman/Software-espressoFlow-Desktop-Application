import React, { useState, forwardRef, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import useStore from '../../store';
import { contextItems } from './ContextShortcuts';
import ShortcutItem from './ShortcutItem';

const CustomComponent = forwardRef((props, ref) => {
  return (
    <div className="shortcuts-item-grid" style={{}} ref={ref}>
      {props.children}
    </div>
  );
});

const ShortcutsList = ({ theme, setEditShortcut, groupName = 'apps' }) => {
  const setAppDragOn = useStore(state => state.setAppDragOn);
  const getContextShortcuts = useStore(state => state.getContextShortcuts)
  const contextShortcuts = useStore(state => state.contextShortcuts);
  const deleteContextShortcut = useStore(state => state.deleteContextShortcut);
  const [active, setActive] = useState('');

  const handleRemove = (id) => {
    deleteContextShortcut(id);
    setActive('');
  };

  useEffect(() => {
    getContextShortcuts()
  }, [])

  return (
    <ReactSortable
      tag={CustomComponent}
      key={`apps-toolbar`}
      group={{ name: groupName, pull: 'clone', put: false }}
      sort={false}
      list={[...contextItems, ...contextShortcuts]}
      setList={currentList => {
        return currentList;
      }}
      onStart={evt => {
        setAppDragOn(true);
      }}
      onEnd={evt => {
        setAppDragOn(false);
      }}
    >
      <>
        {[...contextItems, ...contextShortcuts].map((item, i) => {
          return (
            <ShortcutItem
              key={item.id}
              item={item}
              i={i}
              active={active}
              setActive={setActive}
              handleRemove={handleRemove}
              setEditShortcut={setEditShortcut}
            />
          );
        })}
      </>
    </ReactSortable>
  );
};

export default ShortcutsList;
