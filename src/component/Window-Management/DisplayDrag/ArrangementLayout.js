import React, { useEffect, useLayoutEffect } from 'react';
import { ARRANGEMENTS } from '../../../interfaces/arranagement.interface';
import useStore from '../../../store';
import ArrangementDragArea from './ArrangementDragArea';
import NonDragIcon from './NonDragIcon';

const ArrangementLayout = ({
  displayId,
  displayType,
  displayName,
  rotation,
  active,
  arrangement,
  apps,
}) => {
  const appsList = useStore(state => state.appsList);
  const appDragOn = useStore(state => state.appDragOn);


  if (arrangement === ARRANGEMENTS.MAXIMIZE) {
    let appIcon = apps[0].icon;
    let appName = apps[0].name;
    if (apps.length > 0) {
      const index = appsList.findIndex(app => app.name === apps[0].name);
      if (index > -1) {
        appIcon = appsList[index].icon;
        appName = appsList[index].name;
      }
    }

    return (
      <>
        {active || appDragOn ? (
          <ArrangementDragArea
            data={{
              displayId,
              displayType,
              displayName,
              rotation,
              arrangement,
              apps: [...apps.slice(0, 1)],
              appsList,
            }}
          />
        ) : (
          <div
            className={`${displayType === 'laptop'
              ? 'arrangement-layout-screen-laptop'
              : 'arrangement-layout-screen'
              } arrangement-maximize-layout`}
          >
            <div className="arrangement-app-container">
              <NonDragIcon appName={appName} appIcon={appIcon} rotation={rotation} urls={apps[0].urls} />
              {/* <img
                className="app-icon-drag"
                style={{
                  transform:
                    rotation === 90 
                      ? 'rotate(-90deg)'
                      : rotation === 270
                        ? 'rotate(-270deg)' : rotation === 180 ? 'rotate(-180deg)'
                          : 'rotate(0)',
                }}
                src={appIcon !== '' ? appIcon : baseImagePath('icons/add.svg')}
                alt={appName}
              /> */}

            </div>
          </div>
        )}
      </>
    );
  }

  if (arrangement === ARRANGEMENTS.VERTICALSPLIT) {
    let _apps = [];
    apps.forEach((_app, _i) => {
      if (_i > 1) return;
      const index = appsList.findIndex(app => app.name === _app.name);
      if (index > -1) {
        _apps.push({
          icon: appsList[index].icon,
          name: appsList[index].name,
        });
      } else {
        _apps.push(_app);
      }
    });

    return (
      <>
        {active || appDragOn ? (
          <ArrangementDragArea
            data={{
              displayId,
              displayType,
              displayName,
              rotation,
              arrangement,
              apps: [..._apps.slice(0, 2)],
              appsList,
            }}
          />
        ) : (
          <div
            className={`${displayType === 'laptop'
              ? 'arrangement-layout-screen-laptop'
              : 'arrangement-layout-screen'
              }  ${rotation === 90 || rotation === 270
                ? 'arrangement-horizontal-layout'
                : 'arrangement-vertical-layout'
              }`}
          >
            {_apps.map((app, i) => {
              return (
                <div
                  key={`${displayName}-${app.name}-${i}`}
                  className="arrangement-app-container"
                  style={{ position: 'relative' }}
                >
                  <NonDragIcon appName={app.name} appIcon={app.icon} rotation={rotation} urls={app.urls} />
                  {/* <img
                    className="app-icon-drag"
                    src={
                      app.icon !== ''
                        ? app.icon
                        : baseImagePath('icons/add.svg')
                    }
                    style={{
                      transform:
                        rotation === 90
                          ? 'rotate(-90deg)'
                          : rotation === 180
                            ? 'rotate(-180deg)'
                            : rotation === 270
                              ? 'rotate(-270deg)'
                              : 'rotate(0deg)',
                    }}
                    alt={app.name}
                  /> */}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }

  if (arrangement === ARRANGEMENTS.HORIZONTALSPLIT) {
    let _apps = [];
    apps.forEach((_app, _i) => {
      if (_i > 1) return;
      const index = appsList.findIndex(app => app.name === _app.name);
      if (index > -1) {
        _apps.push({
          icon: appsList[index].icon,
          name: appsList[index].name,
        });
      } else {
        _apps.push(_app);
      }
    });
    return (
      <>
        {active || appDragOn ? (
          <ArrangementDragArea
            data={{
              displayId,
              displayType,
              displayName,
              rotation,
              arrangement,
              apps: [..._apps.slice(0, 2)],
              appsList,
            }}
          />
        ) : (
          <div
            className={`${displayType === 'laptop'
              ? 'arrangement-layout-screen-laptop'
              : 'arrangement-layout-screen'
              }  ${rotation === 90 || rotation === 270
                ? 'arrangement-vertical-layout'
                : 'arrangement-horizontal-layout'
              }`}
          >
            {_apps.map((app, i) => {
              return (
                <div
                  key={`${displayName}-${app.name}-${i}`}
                  className="arrangement-app-container"
                  style={{ position: 'relative' }}
                >
                  <NonDragIcon appName={app.name} appIcon={app.icon} rotation={rotation} urls={app.urls} />
                  {/* <img
                    className="app-icon-drag"
                    src={
                      app.icon !== ''
                        ? app.icon
                        : baseImagePath('icons/add.svg')
                    }
                    alt={app.name}
                    style={{
                      transform:
                        rotation === 90
                          ? 'rotate(-90deg)'
                          : rotation === 180
                            ? 'rotate(-180deg)'
                            : rotation === 270
                              ? 'rotate(-270deg)'
                              : 'rotate(0deg)',
                    }}
                  /> */}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }

  return <div></div>;
};

export default ArrangementLayout;
