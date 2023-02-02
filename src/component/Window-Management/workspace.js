import { useEffect, useState, useRef } from 'react';
import useStore from '../../store';
import AddWorkspaceCard from './AddWorkspaceCard';
import WorkspaceCard from './WorkspaceCard';
import { ROUTES } from '../../utils/RouterPath';
import Modal from '../shared/Modal';
import { baseImagePath, SNAPPING_WALKTHROUGH } from '../../utils/utility';
import { useToasts } from 'react-toast-notifications';
import ReactTooltip from 'react-tooltip';
import { isElement, isEmpty } from 'underscore';

const Workspace = ({ props }) => {
  const { addToast } = useToasts();
  const history = useStore(state => state.history);
  const theme = useStore(state => state.theme);
  const workspaces = useStore(state => state.workspaces);
  const getWorkspaces = useStore(state => state.getWorkspaces);
  const getWebpages = useStore(state => state.getWebpages);
  const returnedWorkspaces = useStore(state => state.returnedWorkspaces);
  const setWorkspace = useStore(state => state.setWorkspace);
  const workspaceState = useStore(state => state.workspaceState);
  const setWorkspaceArrangement = useStore(
    state => state.setWorkspaceArrangement,
  );
  const deleteWorkspace = useStore(state => state.deleteWorkspace);
  const onDeletedWorkspace = useStore(state => state.onDeletedWorkspace);
  const onWorkspaceDone = useStore(state => state.onWorkspaceDone);
  const [activateModalVisible, setActivateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const workspaceActivating = useStore(state => state.workspaceActivating);
  const setWorkspaceEditMode = useStore(state => state.setWorkspaceEditMode);
  const setWorkspaceActivating = useStore(
    state => state.setWorkspaceActivating,
  );
  const setWindowTabVisibilityState = useStore(state => state.setWindowTabVisibilityState);
  const startWorkspaceWalkthrough = useStore(state => state.startWorkspaceWalkthrough);
  const stepIndex = useStore(state => state.workspaceOnboardingStep);
  const setStepIndex = useStore(state => state.setWorkspaceOnboardingStep);
  const setWorkspaceContainerRef = useStore(state => state.setWorkspaceContainerRef);
  const workspaceContainerRef = useRef(null);

  const workspaceTagOptions = useStore(state => state.workspaceTagOptions);
  const getWorkspaceTagOptions = useStore(state => state.getWorkspaceTagOptions);


  useEffect(() => {
    if (!workspaces) {
      getWorkspaces();
      getWebpages();
    }
  }, []);

  useEffect(() => {
    if (workspaceState === 'new' || workspaceState === 'edit') {
      history.push(`${ROUTES.WINDOW_MANAGEMENT}/${workspaceState}`);
    }
  }, []);

  useEffect(() => {
    const deletedWorkspaceUnsubscribe = onDeletedWorkspace(addToast);
    const returnedWorkspaceUnsubscribe = returnedWorkspaces();
    const workspaceDoneUnsubscribe = onWorkspaceDone(
      addToast,
      setWorkspaceActivating,
      setActivateModalVisible,
    );

    return () => {
      returnedWorkspaceUnsubscribe();
      deletedWorkspaceUnsubscribe();
      workspaceDoneUnsubscribe();
    };
  }, []);

  useEffect(() => {
    if (workspaceContainerRef.current) {
      setWorkspaceContainerRef(workspaceContainerRef.current)
    }
  }, [workspaceContainerRef]);

  useEffect(async () => {
    await getWorkspaceTagOptions();
  }, []);

  const handleEdit = (state, workspace) => {
    setWorkspace(state, workspace);
    setWorkspaceEditMode(false);
    setWindowTabVisibilityState('hidden'); // hide the tabBar when in workspace edit mode
  };

  const handleDelete = workspace => {
    setSelectedWorkspace(workspace);
    setDeleteModalVisible(!deleteModalVisible);
  };

  const deleteWorkspaceById = () => {
    deleteWorkspace(selectedWorkspace.id);
    setDeleteModalVisible(!deleteModalVisible);
  };

  const handleWorkspaceActivate = workspace => {
    setWorkspaceActivating({ id: workspace.id, loading: true });
    setWorkspaceArrangement(workspace);
  };

  return (
    <div className="workspace-container onboarding-workspace-step13" ref={workspaceContainerRef}>
      <AddWorkspaceCard
        theme={theme}
        handleClick={() => {
          if (workspaceActivating.loading) return;
          if (startWorkspaceWalkthrough) {
            setStepIndex(SNAPPING_WALKTHROUGH.WORKSPACE_APP_TRAY)
          }
          handleEdit('new', {});
        }}
      />
      {workspaces && stepIndex !== SNAPPING_WALKTHROUGH.WORKSPACE_START && stepIndex !== SNAPPING_WALKTHROUGH.WORKSPACE_ADD_NEW_WORKSPACE && stepIndex !== SNAPPING_WALKTHROUGH.WORKSPACE_HOLDER && stepIndex !== SNAPPING_WALKTHROUGH.WORKSPACE_LAUNCH_NEW && stepIndex !== SNAPPING_WALKTHROUGH.FINISH &&
        workspaces.map((workspace, index) => (
          <WorkspaceCard
            key={workspace.id}
            index={index}
            theme={theme}
            workspace={workspace}
            handleEdit={() => handleEdit('edit', workspace)}
            handleDelete={handleDelete}
            handleWorkspaceActivate={handleWorkspaceActivate}
            workspaceActivating={workspaceActivating}
          />
        ))}

      {(stepIndex === SNAPPING_WALKTHROUGH.WORKSPACE_HOLDER || stepIndex === SNAPPING_WALKTHROUGH.WORKSPACE_LAUNCH_NEW || stepIndex === SNAPPING_WALKTHROUGH.FINISH) && <WorkspaceCard
        key={workspaces[workspaces.length - 1].id}
        index={workspaces.length - 1}
        theme={theme}
        workspace={workspaces[workspaces.length - 1]}
        handleEdit={() => handleEdit('edit', workspaces[workspaces.length - 1])}
        handleDelete={handleDelete}
        handleWorkspaceActivate={handleWorkspaceActivate}
        workspaceActivating={workspaceActivating}
      />}

      {activateModalVisible && (
        <Modal
          title=""
          onClose={() => {
            if (workspaceActivating.loading) return;
            setActivateModalVisible(!activateModalVisible);
          }}
        >
          {workspaceActivating.loading ? (
            <div className="modal-loader-container">
              <img
                height="50"
                width="50"
                src={baseImagePath('icons/oval-loader.svg')}
                alt="workspace loading"
              />
              <p>Workspace is setting up...</p>
            </div>
          ) : (
            <div className="workspace-activate-modal-body">
              <div>
                <p>Would you like to activate this workspace?</p>
                <p>It would take several seconds.</p>
              </div>

              <div>
                <button
                  className="modal-body-no-btn"
                  type="button"
                  onClick={() => setActivateModalVisible(!activateModalVisible)}
                >
                  No
                </button>
                <button
                  className="modal-body-yes-btn"
                  type="button"
                  onClick={handleWorkspaceActivate}
                >
                  Yes
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {deleteModalVisible && (
        <Modal
          title=""
          onClose={() => setDeleteModalVisible(!deleteModalVisible)}
        >
          <div className="workspace-activate-modal-body">
            <div>
              <p>Would you like to delete this workspace?</p>
              <br></br>
              <p>"{selectedWorkspace.name}"</p>
            </div>

            <div className="modal-btn-group">
              <button
                className="modal-body-no-btn"
                type="button"
                onClick={() => setDeleteModalVisible(!deleteModalVisible)}
              >
                No
              </button>
              <button
                className="modal-body-yes-btn"
                type="button"
                onClick={deleteWorkspaceById}
              >
                Yes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Workspace;
