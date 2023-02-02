import React, { forwardRef, useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import useStore from '../../../../store';
import { baseImagePath } from '../../../../utils/utility';
import Icon from './Icon';
import { ARRANGEMENTS } from '../../../../interfaces/arranagement.interface';



export const DropLayout = forwardRef((props, ref) => {

  return (
    <div className="drop-layout" ref={ref}>
      {props.children}
    </div>
  );
});

const SingleList = ({ data, slotIndex }) => {
  const { displayId, apps, arrangement } = data;
  const appsList = useStore(state => state.appsList);
  const addWorkspaceApp = useStore(state => state.addWorkSpaceApp);
  const removeAppFromWorkspace = useStore(
    state => state.removeAppFromWorkspace,
  );

  let spillEnabled = true;

  return (
    <ReactSortable
      tag={DropLayout}
      fallbackOnBody={true}
      swapThreshold={1}
      group={{ name: 'apps', pull: true, put: true }}
      animation={50}
      emptyInsertThreshold={10}
      fallbackTolerance={10}
      ghostClass={
        data.rotation === 90
          ? 'icon-drag-90'
          : data.rotation === 180
            ? 'icon-drag-180'
            : data.rotation === 270
              ? 'icon-drag-270'
              : 'icon-drag-0'
      }
      chosenClass={
        data.rotation === 90
          ? 'icon-drag-90'
          : data.rotation === 180
            ? 'icon-drag-180'
            : data.rotation === 270
              ? 'icon-drag-270'
              : 'icon-drag-0'
      }
      dragClass={
        data.rotation === 90
          ? 'icon-drag-90'
          : data.rotation === 180
            ? 'icon-drag-180'
            : data.rotation === 270
              ? 'icon-drag-270'
              : 'icon-drag-0'
      }
      removeCloneOnHide={true}
      draggable=".app-icon-container"
      list={apps}
      setList={(currentList, _, { dragging }) => {
        if (!dragging) return;
      }}
      onAdd={evt => {
        try {
          let itemEl = evt.item; // dragged HTMLElement
          let origParent = evt.from;
          if (origParent.className !== 'drop-layout') {
            origParent.appendChild(itemEl);
          }

          const appName = evt.item.getAttribute('data-name');
          const type = evt.item.getAttribute('data-type');
          const originalIndex = evt.item.getAttribute('data-index');

          setTimeout(() => {
            addWorkspaceApp(
              displayId,
              appName,
              slotIndex,
              originalIndex,
              arrangement,
              type,
              data.rotation,
            );
          }, 40)

        } catch (error) {
          console.log(error)
        }


      }}
      removeOnSpill={spillEnabled}
      onSpill={evt => {
        try {
          const item = evt.target;
          const appName = item.querySelector('div').getAttribute('data-name');
          if (appName !== '') {
            removeAppFromWorkspace(displayId, appName, slotIndex);
          }
        } catch (error) {
          console.log(error);
        }
      }}
    >
      {apps.length > 0 &&
        apps.map((item, _i) => {
          const index = appsList.findIndex(app => app.name === item.name);
          let icon = item.icon === '' ? baseImagePath('icons/emptyState.svg') : item.icon;
          let className = 'app-icon-drag';
          if (index > -1) {
            icon = appsList[index].icon;
            className = 'app-icon';
          }

          return (
            <Icon
              key={`${item.name}-${displayId}-${_i}`}
              item={item}
              icon={icon}
              className={className}
              rotation={data.rotation}
              i={_i}
              slotIndex={slotIndex}
              displayId={displayId}
            />
          );
        })}
    </ReactSortable>
  );
};

export default SingleList;
