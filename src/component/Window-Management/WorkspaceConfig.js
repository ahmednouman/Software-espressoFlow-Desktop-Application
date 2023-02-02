import React, { useEffect } from 'react';
import useStore from '../../store';
import WorkspaceCaptureButton from './WorkspaceCaptureButton';
import WorkspaceNameInput from './WorkspaceNameInput';
import WorkspaceTagSelect from './WorkspaceTagSelect';
import WorkspaceTagEditPopup from './WorkspaceTagEditPopup';
import AppToolbar from './AppToolbar/Index';
import AppPopup from './AppPopup/index';
import DisplayDrag from './DisplayDrag/Index';
import { useToasts } from 'react-toast-notifications';
import WorkspaceSaveButton from './WorkspaceSaveButton';
import SNAPPING_WALKTHROUGH from '../../utils/utility';

const WorkspaceConfig = props => {
  //const theme = useStore(state => state.theme);
  const workspaceSaveState = useStore(state => state.workspaceSaveState);
  const setWorkspaceSaveState = useStore(state => state.setWorkspaceSaveState);
  const workspaceAppPopupVisible = useStore(
    state => state.workspaceAppPopupVisible,
  );

  const saveWorkspace = useStore(state => state.saveWorkspace);
  const onSavedWorkspace = useStore(state => state.onSavedWorkspace);
  const { addToast } = useToasts();
  const onWorkspaceDone = useStore(state => state.onWorkspaceDone);
  const startWorkspaceWalkthrough = useStore(state => state.startWorkspaceWalkthrough);
  const stepIndex = useStore(state => state.workspaceOnboardingStep);
  const setStepIndex = useStore(state => state.setWorkspaceOnboardingStep);


  const setWindowTabVisibilityState = useStore(state => state.setWindowTabVisibilityState);
  const setWorkspaceTagOptions = useStore(state => state.setWorkspaceTagOptions);
  const setWorkspaceTagEditPopupVisible = useStore(state => state.setWorkspaceTagEditPopupVisible);



  useEffect(() => {
    onSavedWorkspace(addToast);
    const unsubscribeWorkspaceDone = onWorkspaceDone();
    return () => {
      unsubscribeWorkspaceDone();
    };
  }, []);

  const handleSaveWorkspace = () => {
    try {
      if (startWorkspaceWalkthrough && stepIndex !== SNAPPING_WALKTHROUGH.WORKSPACE_SAVE) return

      setWorkspaceSaveState(true);
      saveWorkspace();

      // save any changes to tags
      setWorkspaceTagOptions();

      // show the tabBar again when returning
      setWindowTabVisibilityState('visible');

      if (startWorkspaceWalkthrough) {
        setStepIndex(SNAPPING_WALKTHROUGH.WORKSPACE_HOLDER)
      }

    } catch (error) {
      setWorkspaceSaveState(false);
      console.log(error.message);
    }
  };

  const handleWorkspaceConfigClick = () => {
    setWorkspaceTagEditPopupVisible(false);
  };

  return (
    <section style={{ height: '49vh' }} onClick={handleWorkspaceConfigClick}>
      <div style={{ height: '85%' }}>

        <div className="config-settings">
          {/* <WorkspaceCaptureButton /> */}
          <WorkspaceNameInput loading={workspaceSaveState} />
          <WorkspaceTagSelect />
        </div>

        <div
          className="es_device_inner_wrap es_device_screen3_wrap"
          style={{ height: '100%' }}
        >
          <div
            className="es_device_cols es_func_device_cols_wrapper"
            style={{ height: '100%' }}
          >
            <DisplayDrag />
          </div>
        </div>
      </div>


      <WorkspaceSaveButton loading={workspaceSaveState} handleSaveWorkspace={handleSaveWorkspace} />

      <AppToolbar />
      {workspaceAppPopupVisible && <AppPopup />}
    </section>
  );
};

export default WorkspaceConfig;
