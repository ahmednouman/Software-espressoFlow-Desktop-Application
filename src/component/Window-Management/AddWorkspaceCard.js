import React from 'react';
import { baseImagePath } from '../../utils/utility';

const AddWorkspaceCard = ({ theme, handleClick }) => {
  return (
    <div className="workspace-card onboarding-workspace-step5" onClick={handleClick} >
      <div className="workspace-image-text-container">
        <div className="add-workspace-card">
          <img src={baseImagePath('icons/add-white.svg')} alt="new workspace" />
        </div>
        <p
          className={`workspace-name ${theme === 'dark' ? 'text-white' : 'text-black'
            }`}
        >
          New workspace
        </p>
      </div>
    </div >
  );
};

export default AddWorkspaceCard;
