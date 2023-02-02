import React from 'react';
import useStore from '../../store';

const EditWorkspaceButton = ({ theme }) => {
  const workspaceEditMode = useStore(state => state.workspaceEditMode);
  const setWorkspaceEditMode = useStore(state => state.setWorkspaceEditMode);

  if (workspaceEditMode) {
    return (
      <button
        className={'primary-btn'}
        style={{
          width: '150px',
          margin: '0 auto',
          height: '30px',
        }}
        onClick={() => setWorkspaceEditMode(!workspaceEditMode)}
      >
        Done
      </button>
    );
  }
  return (
    <button
      className={'edit-workspace-btn'}
      style={{
        color: theme === 'light' ? '#2F80ED' : '#FFFFFF',
        width: '150px',
        margin: '0 auto',
      }}
      onClick={() => setWorkspaceEditMode(!workspaceEditMode)}
    >
      Edit workspaces
    </button>
  );
};

export default EditWorkspaceButton;
