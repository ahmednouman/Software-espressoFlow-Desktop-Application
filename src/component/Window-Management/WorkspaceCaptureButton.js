import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import { baseImagePath } from '../../utils/utility';


const WorkspaceCaptureButton = ({ loading }) => {

  const handleWorkspaceCapture = () => {
    console.log("workspace capture button pressed");
  }


  return (
    <div
      className="config-capture-workspace-button"
    >
      <button
        type="button"
        className={'workspace-capture-button'}
        onClick={handleWorkspaceCapture}
      >
        <img
          className="workspace-capture-icon"
          height="24px"
          width="24px"
          src={baseImagePath(
            // theme === 'light' ? 'icons/add.svg' : 'icons/add_white.svg',
            'icons/captureWindows.svg'
          )}
          alt="capture workspace"
          data-tip="Capture windows"
        />
      </button>

    </div>
  );
};

export default WorkspaceCaptureButton;
