import React from 'react';
import useStore from '../../store';

const WorkspaceNameInput = ({ loading }) => {
  const workspaceName = useStore(state => state.workspaceName);
  const setWorkspaceName = useStore(state => state.setWorkspaceName);

  const handleChange = e => {
    e.stopPropagation();
    setWorkspaceName(e.target.value);
  };

  return (
    <div className="onboarding-workspace-step10 workspace-input-container">
      <input
        disabled={loading}
        type="text"
        name="workspace-name"
        placeholder="Name your workspace"
        value={workspaceName}
        onChange={handleChange}
        maxLength="50"
      />
    </div>
  );
};

export default WorkspaceNameInput;
