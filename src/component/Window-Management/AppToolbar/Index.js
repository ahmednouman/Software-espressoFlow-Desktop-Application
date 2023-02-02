import React from 'react';
import useStore from '../../../store';
import { baseImagePath, osFinder } from '../../../utils/utility';
import ContextToolbar from '../../Context/ContextToolbar';
import AppSortableList from './AppSortableList';
import ReactTooltip from 'react-tooltip';

const setWorkspaceAppPopupVisibleSelector = state => state.toggleAppPopupWindow;

const AppToolbar = ({ groupName = 'apps' }) => {
  const theme = useStore(state => state.theme);
  const toolbarAppCount = useStore(state => state.toolbarAppCount);
  const flowWindowPermissions = useStore(state => state.flowWindowPermissions);

  const setWorkspaceAppPopupSelectedTab = useStore(state => state.setWorkspaceAppPopupSelectedTab);
  const setWorkspaceAppPopupVisible = useStore(
    setWorkspaceAppPopupVisibleSelector,
  );
  const startWorkspaceWalkthrough = useStore(state => state.startWorkspaceWalkthrough)
  const setStepIndex = useStore(state => state.setWorkspaceOnboardingStep)
  const tooltip = useStore(state => state.toolTip);
  const setToolTip = useStore(state => state.setToolTip);


  const handleRightArrow = () => {
    const toolbarContainer = document.querySelector('.toolbar-container');
    toolbarContainer.scrollBy(40, 0);
  };

  const handleLeftArrow = () => {
    const toolbarContainer = document.querySelector('.toolbar-container');
    toolbarContainer.scrollBy(-40, 0);
  };

  return (

    <div className="app-toolbar" >

      {groupName === 'context' ? (
        <ContextToolbar />
      ) : (
        <AppSortableList theme={theme} groupName={groupName} />
      )}

      <img
        className="add-app-icon onboarding-workspace-step7"
        height="24px"
        width="24px"
        src={baseImagePath('icons/addApp.svg')}
        alt="add app"
        data-tip="Add app"
        onClick={() => {
          if (!flowWindowPermissions && osFinder("Mac")) return;
          if (startWorkspaceWalkthrough) {
            setStepIndex(8)
          }
          if (tooltip.visible) {
            setToolTip({ ...tooltip, visible: false })
          }
          setWorkspaceAppPopupSelectedTab('apps');
          setWorkspaceAppPopupVisible(true);
        }}
        onMouseOver={e => { e.currentTarget.src = baseImagePath('icons/addApp_hover.svg') }}
        onMouseOut={e => { e.currentTarget.src = baseImagePath('icons/addApp.svg') }}
      />
    </div>

  );
};

export default AppToolbar;
