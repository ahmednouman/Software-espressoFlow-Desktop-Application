import React, { useEffect, useState } from 'react';
import useStore from '../../store';

var allowSave = false;

const WorkspaceSaveButton = ({ loading, handleSaveWorkspace }) => {
  const [appsSet, setApps] = useState(false);
  const workspaceDisplays = useStore(state => state.workspaceDisplays);
  const workspaceName = useStore(state => state.workspaceName);
  const workspaceSaveButtonVisible = useStore(
    state => state.workspaceSaveButtonVisible,
  );
  const workspaceAppPopupVisible = useStore(state => state.workspaceAppPopupVisible);
  const workspaceTagEditPopupVisible = useStore(state => state.workspaceTagEditPopupVisible);

  useEffect(() => {
    if (!loading && workspaceName !== '' && appsSet && !workspaceTagEditPopupVisible && !workspaceAppPopupVisible) {
      allowSave = true;
    } else {
      allowSave = false;
    }
  }, [appsSet, workspaceName, workspaceTagEditPopupVisible, workspaceAppPopupVisible]);

  useEffect(() => {
    if (workspaceDisplays.length === 0) return;
    let totalApps = 0;

    for (const displays of workspaceDisplays) {
      const apps = displays.apps;

      for (const app of apps) {
        if (app.name !== '') {
          totalApps++;
        }
      }
    }
    if (totalApps > 0) {
      setApps(true);
    } else {
      setApps(false);
    }
  }, [workspaceDisplays]);

  useEffect(() => {
    const keyDownHandler = event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (allowSave) {
          handleSaveWorkspace();
        }
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  return (
    <div
      className="config-workspace-buttons"
      style={{}}
    >
      {workspaceSaveButtonVisible && (
        <button
          type="button"
          disabled={!loading && workspaceName !== '' && appsSet ? false : true}
          className={
            !loading && workspaceName !== '' && appsSet
              ? 'workspace-save-button-enabled onboarding-workspace-step11'
              : 'workspace-save-button-disabled onboarding-workspace-step11'
          }
          onClick={handleSaveWorkspace}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      )}
    </div>
  );
};

export default WorkspaceSaveButton;
