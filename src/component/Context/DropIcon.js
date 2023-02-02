import React, { forwardRef } from 'react';
import { ReactSortable } from 'react-sortablejs';
import useStore from '../../store';
import { baseImagePath, TextTruncate } from '../../utils/utility';
import { contextItems } from './ContextShortcuts';

export const DropLayout = forwardRef((props, ref) => {
  return (
    <div className="drop-shortcut-layout" style={{ padding: '1rem' }} ref={ref}>
      {props.children}
    </div>
  );
});

const DropIcon = ({ data, slotIndex }) => {
  const addContextShortcut = useStore(state => state.addContextShortcut);
  const removeContextShortcut = useStore(state => state.removeContextShortcut);

  let spill = false;

  return (
    <ReactSortable
      tag={DropLayout}
      fallbackOnBody={true}
      swapThreshold={1}
      sort={false}
      group={{ name: 'shortcuts', pull: true, put: true }}
      animation={50}
      emptyInsertThreshold={5}
      fallbackTolerance={5}
      ghostClass="ghost-drag"
      dragClass="ghost-drag"
      removeCloneOnHide={true}
      draggable=".app-icon-container"
      list={[data]}
      direction="horizontal"
      setList={(currentList, _, { dragging }) => {
        if (!dragging) return;
      }}
      onAdd={evt => {
        let itemEl = evt.item; // dragged HTMLElement
        let origParent = evt.from;
        itemEl.classList.add("ghost-drag")
        origParent.appendChild(itemEl);


        const appName = evt.item.getAttribute('data-name');
        const shortcutId = evt.item.getAttribute('data-shortcut-id');
        const type = evt.item.getAttribute('data-type');
        const originalIndex = origParent
          .querySelector('div')
          .getAttribute('data-index');

        addContextShortcut(shortcutId, appName, slotIndex, originalIndex, type);
      }}
      removeOnSpill={true}
      onEnd={evt => {
        if (spill) {
          evt.target.appendChild(evt.item);
          removeContextShortcut(slotIndex);
        }
        spill = false;
      }}
      onSpill={evt => {
        spill = true;
      }}
    >
      {data &&
        [data].map((item, _i) => {
          return (
            <div
              key={`${item.name}-${_i}`}
              data-id={item.id}
              data-shortcut-id={item.id}
              data-name={item.name}
              data-index={slotIndex}
              className={item.name !== 'add' ? 'app-icon-container' : ''}
            >
              <>
                {item.icon && item.icon.icon ? (
                  <img
                    className="app-icon"
                    src={baseImagePath(item.icon.icon)}
                    alt={item.name}
                  />
                ) : (
                  <p className="drop-icon-text">
                    {TextTruncate(item.name, 10)}
                  </p>
                )}
              </>
            </div>
          );
        })}
    </ReactSortable>
  );
};

export default DropIcon;
