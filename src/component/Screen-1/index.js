/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store';
import { ROUTES } from '../../utils/RouterPath';
import { baseImagePath, osFinder } from '../../utils/utility';

const ScreenOneComponent = props => {
  const checkPermissions = useStore(state => state.checkPermissions);
  const permission = useStore(state => state.permission)
  const theme = useStore(state => state.theme);
  const tutorialDone = useStore(state => state.tutorialDone);
  const getTutorialDone = useStore(state => state.getTutorialDone);
  const flowWindowPermissions = useStore(state => state.flowWindowPermissions);
  const { displays } = useStore();
  const version = useStore(state => state.version);
  const workspaceEnabled = useStore(state => state.workspaceEnabled);


  useEffect(() => {
    const unsubscribe = getTutorialDone();

    if (osFinder('Mac')) {
      checkPermissions();

      return () => {
        unsubscribe();
      };
    }

    return () => {
      unsubscribe();
    };
  }, [checkPermissions]);



  useEffect(() => {

    console.log(osFinder('Mac'), tutorialDone.version === version, version)
    if (
      (tutorialDone.completed &&
        tutorialDone.version === version &&
        !osFinder('Mac')) ){
          props.history.push(ROUTES.SCREEN_THREE_PATH);        
        } else if (tutorialDone.completed &&
          tutorialDone.version === version &&
          permission &&
          (flowWindowPermissions || !workspaceEnabled)) {
            props.history.push(ROUTES.SCREEN_THREE_PATH);
        }

  }, [tutorialDone.version, tutorialDone.completed, permission, flowWindowPermissions, workspaceEnabled, version]);


  return (
    <div className="es_started_cont_wrap">
      <div className="es_started_cont">
        <h6 className={theme === 'dark' ? 'text-white' : ''}>Plug in and go</h6>
        <h1 className={theme === 'dark' ? 'text-white' : ''}>
          Let’s get started
        </h1>
        {displays.length > 0 ? (
          <>
            <Link
              to={
                osFinder('Mac') && (!permission || !flowWindowPermissions)
                  ? ROUTES.SCREEN_PERMISSIONS
                  : tutorialDone.completed && tutorialDone.version === version
                    ? ROUTES.SCREEN_THREE_PATH
                    : ROUTES.SCREEN_TWO_PATH
              }
            >
              <img
                src={
                  theme === 'light'
                    ? baseImagePath('icons/next_arrow.svg')
                    : baseImagePath('icons/next-arrow-white.svg')
                }
                alt="icon"
              />
            </Link>
          </>
        ) : (
          <div className="es_waiting_container">
            <img
              src={baseImagePath('thumbnails/tablet-img1.svg')}
              alt="display"
              className="es_waiting"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenOneComponent;
