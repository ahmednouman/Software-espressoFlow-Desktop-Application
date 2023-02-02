import React, { useState } from 'react';
import useStore from '../../store';
import { baseImagePath, SNAPPING_WALKTHROUGH, TextTruncate } from '../../utils/utility';
import WorkspacePreviews from './WorkspacePreviews';
import ReactTooltip from 'react-tooltip';

const WorkspaceCard = ({
  theme,
  index,
  workspace,
  handleEdit,
  handleDelete,
  handleWorkspaceActivate,
  workspaceActivating,
}) => {
  const [hover, setHover] = useState(false)
  const workspaceEditMode = useStore(state => state.workspaceEditMode);
  const stepIndex = useStore(state => state.workspaceOnboardingStep);

  const workspaceTagOptions = useStore(state => state.workspaceTagOptions);

  const workspaceStore = useStore(state => state.workspace);
  const setWorkspaceTag = useStore(state => state.setWorkspaceTag);

  let borderColor = 'transparent';
  if (workspaceEditMode && theme === 'light') {
    borderColor = '1px solid #606060';
  } else if (workspaceEditMode) {
    borderColor = '1px solid white';
  }


  let workspaceTagObject = null;
  if (workspace.tag !== null && workspace.tag !== undefined && workspace.tag !== '' &&
    workspaceTagOptions !== null && workspaceTagOptions !== undefined) {

    workspaceTagObject = workspaceTagOptions[workspace.tag];
  }

  return (
    <>
      <div
        className={`workspace-card ${stepIndex > SNAPPING_WALKTHROUGH.WORKSPACE_SAVE && 'onboarding-workspace-step12'} `}
        style={{
          border: borderColor,
          justifyContent: workspaceEditMode ? 'space-between' : 'flex-start',
        }}

        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}

      >
        <div className="workspace-image-text-container">
          <div
            className="workspace-image-container"
            style={{
              background: workspace.gradient || 'rgba(255,255,255,0.6)',
            }}
            onClick={() => {
              if (workspaceActivating.loading || workspaceEditMode) return;
              handleWorkspaceActivate(workspace);
            }}
          >
            <WorkspacePreviews displays={workspace.displays} />

            {workspaceActivating.loading &&
              workspaceActivating.id === workspace.id && (
                <div className="workspace-loader">
                  <img
                    height="40"
                    width="40"
                    src={baseImagePath('icons/tail-spin.svg')}
                    alt="workspace loading"
                  />
                </div>
              )}
          </div>
          <p className={`workspace-name ${theme === 'dark' ? 'text-white' : 'text-black'}`} >
            {TextTruncate(workspace.name, 10)}
          </p>
          {workspace.tag !== null && workspace.tag !== undefined && workspaceTagObject !== null ?
            <div
              className='workspace-tag'
              style={{
                background: workspaceTagObject.backgroundColor,
                color: workspaceTagObject.textColor,
                width: 'fit-content',
                height: '20px',
                borderRadius: '6px',
                padding: '2px 6px',
                marginTop: '5px',
                marginBottom: '5px',
                minWidth: '20px'
              }}
            >
              {workspaceTagObject.label}
            </div> : <div></div>
          }
          <div className="workspace-card-icon-container" style={{
            visibility: hover ? 'visible' : "hidden"
          }}>
            <img
              height="20px"
              width="20px"
              src={baseImagePath(
                `${theme === 'light' ? 'icons/bin.svg' : 'icons/bin_dark.svg'}`,
              )}
              alt="delete workspace"
              data-tip="Delete"
              onClick={() => handleDelete(workspace)}
            />
            <img
              height="25px"
              width="25px"
              src={baseImagePath(
                `${theme === 'light'
                  ? 'icons/pen_icon.svg'
                  : 'icons/pen_icon_light.svg'
                }`,
              )}
              alt="edit workspace"
              data-tip="Edit"
              onClick={handleEdit}
            />
          </div>
        </div>
      </div>
      <ReactTooltip place="bottom" effect="solid" className="screen3-tooltip" arrowColor="transparent" backgroundColor="rgba(90, 90, 90, 1)" />
    </>
  );
};

export default WorkspaceCard;
