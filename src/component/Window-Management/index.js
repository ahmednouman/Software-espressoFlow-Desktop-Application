/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import useStore from '../../store/index';
import Button from '../shared/Button';
import Dialog from '../shared/Dialog';
import Container from '../shared/Container';
import WindowManagementTabs from './tabs';
import Workspace from './workspace';
import WorkspaceConfig from './WorkspaceConfig';
import Onboarding from './Onboarding';
import { osFinder } from '../../utils/utility';
import ReactTooltip from 'react-tooltip';

const getTitle = (tabState, workspaceState) => {
  switch (tabState) {
    case 'snap':
      return 'Boost productivity with shortcuts';
    case 'workspace':
      if (workspaceState === 'list') {
        return 'Launch your workspace or create a new one';
      } else {
        return 'Click each screen to create screen areas and drag apps to each area';
      }
    default:
      return '';
  }
};


const WindowManagementComponent = props => {
  const flowWindowPermissions = useStore(state => state.flowWindowPermissions);
  const [dialogVisible, setDialogVisible] = useState(false);
  const conflictingApp = useStore(state => state.conflictingAppFlowWindow);
  const getApps = useStore(state => state.getApps);
  const checkFlowWindowPermissions = useStore(
    state => state.checkFlowWindowPermissions,
  );
  const checkConflictingApp = useStore(state => state.checkConflictingApp);
  const promptFlowWindowAccessibility = useStore(
    state => state.promptFlowWindowAccessibility,
  );
  const returnedApps = useStore(state => state.returnedApps);
  const restartFlow = useStore(state => state.restartFlow)
  const onConflictingApp = useStore(state => state.onConflictingApp);
  const workspaceEnabled = useStore(state => state.workspaceEnabled);
  const setWorkspaceEnabled = useStore(state => state.setWorkspaceEnabled);


  useEffect(() => {
    setDialogVisible(!flowWindowPermissions);
    if (conflictingApp !== "" && osFinder("Mac")) {
      setDialogVisible(true)
    }
  }, [conflictingApp]);

  useEffect(() => {
    checkFlowWindowPermissions();
    getApps();
    if (conflictingApp === "" && osFinder("Mac")) {
      checkConflictingApp();
    }

    const unsubscribeConflictingApp = onConflictingApp()
    const unsubscribeReturnedApps = returnedApps();

    return () => {
      unsubscribeReturnedApps();
      unsubscribeConflictingApp()
    };
  }, [conflictingApp]);

  const tabState = useStore(state => state.windowTabState);
  const workspaceState = useStore(state => state.workspaceState);

  let title = getTitle(tabState, workspaceState);

  return (
    <>
      <Onboarding />
      <Container title={title}>
        {!flowWindowPermissions && dialogVisible && (osFinder("Mac")) && workspaceEnabled && (
          <Dialog message="espressoFlow needs accessibility enabled">
            <div className="flow-window-accessibility-buttons">
              <button
                className="link-button"
                onClick={() => setDialogVisible(!dialogVisible)}
              >
                Go back
              </button>
              <Button
                label="Enable now"
                handleClick={promptFlowWindowAccessibility}
              />
            </div>
          </Dialog>
        )}
        {conflictingApp && conflictingApp !== '' && conflictingApp !== "none" && dialogVisible && (
          <Dialog
            message={`Conflicting app detected: ${conflictingApp}. Please uninstall ${conflictingApp} and restart Flow to gain full functionality of Flow.`}
          >
            <div className="flow-window-accessibility-buttons">
              <button
                className="link-button"
                onClick={() => setDialogVisible(!dialogVisible)}
              >
                Go back
              </button>
              <Button
                label="Restart Flow"
                handleClick={restartFlow}
              />
            </div>
          </Dialog>
        )}
        {(workspaceEnabled) ?
          (<WindowManagementTabs {...props}>
            {workspaceState === 'list' && <Workspace {...props} />}
            {(workspaceState === 'new' || workspaceState === 'edit') && (
              <WorkspaceConfig {...props} />
            )}
          </WindowManagementTabs>)
          :
          <div className="mirrorContainer" style={{ color: 'white', fontSize: '14px' }}>
            To boost productivity with shortcuts and workspaces, please enable by pressing the button below.
            <div style={{ paddingTop: '20px', paddingBottom: '50px' }}>
              <button onClick={() => setWorkspaceEnabled({ value: !workspaceEnabled })} className="primary-btn-purple">Enable Snap and Workspaces</button>
            </div>
          </div>
        }
      </Container>
     {/* <ReactTooltip place="bottom" effect="solid" className="screen3-tooltip" arrowColor="transparent" backgroundColor="rgba(90, 90, 90, 1)" /> */}
    </>
  );
};

export default WindowManagementComponent;
