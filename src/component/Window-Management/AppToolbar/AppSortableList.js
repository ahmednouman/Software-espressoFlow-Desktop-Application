import React, { useState, useEffect, forwardRef } from 'react';
import { ReactSortable } from 'react-sortablejs';
import useStore from '../../../store';
import ToolbarIcon from './ToolbarIcon';

const CustomComponent = forwardRef((props, ref) => {
  const childrenArray = props.children[0].props.children;
  const setToolbarAppCount = useStore(state => state.setToolbarAppCount);

  useEffect(() => {
    setToolbarAppCount(childrenArray.length)
  }, []);


  return (
    <div
      className="toolbar-container onboarding-workspace-step6"
      style={{
        justifyContent: childrenArray.length > 16 ? 'flex-start' : 'center',
        paddingLeft: childrenArray.length > 16 ? '0px' : '1rem',
      }}
      ref={ref}
    >
      {props.children}
    </div>
  );
});

const AppSortableList = ({ theme, groupName = 'apps', isDisabled = false }) => {
  const appsList = useStore(state => state.appsList);
  const webpagesList = useStore(state => state.webpagesList);
  const [availableApps, setAvailableApps] = useState([]);
  const setAppDragOn = useStore(state => state.setAppDragOn);
  const [disabled, setDisabled] = useState(isDisabled);

  useEffect(() => {
    const _availableApps = appsList.filter(app => app.checked === 'true');
    setAvailableApps(_availableApps);
  }, [appsList]);

  if (
    [...availableApps, ...webpagesList.filter(page => page.checked === 'true')]
      .length === 0
  ) {
    return (
      <span
        className={`add-apps-text ${theme === 'light' ? 'text-black' : 'text-white'
          } onboarding-workspace-step6`}
      >
        Add apps to your workspace
      </span>
    );
  }

  return (
    <ReactSortable
      tag={CustomComponent}
      key={`apps-toolbar`}
      disabled={disabled}
      group={{ name: groupName, pull: 'clone', put: false }}
      sort={false}
      list={[...availableApps, ...webpagesList]}
      setList={currentList => {
        return currentList;
      }}
      draggable=".app-toolbar-icon"
      onStart={evt => {
        setAppDragOn(true);
      }}
      onEnd={evt => {
        setAppDragOn(false);
      }}
    >
      <>
        {[
          ...availableApps,
          ...webpagesList.filter(page => page.checked === 'true'),
        ].map((item, i) => {
          return (
            <ToolbarIcon
              key={`${item.name}-${i}`}
              id={item.id || ''}
              name={item.name}
              icon={item.icon}
              urls={item.urls || []}
              setDisabled={setDisabled}
            />
          );
        })}
      </>
    </ReactSortable>
  );
};

export default AppSortableList;
