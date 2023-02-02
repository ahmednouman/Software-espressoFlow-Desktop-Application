import React from 'react';
import useStore from '../../store';
import ReactTooltip from 'react-tooltip';

const BackButton = ({ theme }) => {
  const setWorkspaceState = useStore(state => state.setWorkspaceState);
  const setWindowTabVisibilityState = useStore(state => state.setWindowTabVisibilityState);

  return (
    <>
      <button
        className="workspace-back-btn"
        type="button"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setWorkspaceState('list');
          setWindowTabVisibilityState('visible');
        }}
        data-tip="Back"
      >
        <svg
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.5 1.13636C6.22404 1.13636 1.13637 6.22403 1.13637 12.5C1.13637 18.776 6.22404 23.8636 12.5 23.8636C18.776 23.8636 23.8636 18.776 23.8636 12.5C23.8636 6.22404 18.776 1.13636 12.5 1.13636ZM12.5 1.62913e-06C5.59645 4.22072e-07 7.20732e-06 5.59644 6.00027e-06 12.5C4.79321e-06 19.4036 5.59644 25 12.5 25C19.4036 25 25 19.4036 25 12.5C25 5.59644 19.4036 2.83618e-06 12.5 1.62913e-06Z"
            fill={theme === 'light' ? '#303030' : '#FFFFFF'}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.7365 16.5172L8.12061 12.9013C7.89872 12.6794 7.89872 12.3196 8.12061 12.0978L11.7365 8.48187C11.9584 8.25999 12.3181 8.25999 12.54 8.48187C12.7619 8.70376 12.7619 9.06352 12.54 9.2854L9.89409 11.9313L17.6133 11.9313L17.6133 13.0677L9.89409 13.0677L12.54 15.7136C12.7619 15.9355 12.7619 16.2953 12.54 16.5172C12.3181 16.7391 11.9584 16.7391 11.7365 16.5172Z"
            fill={theme === 'light' ? '#303030' : '#FFFFFF'}
          />
        </svg>
      </button>
      <ReactTooltip place="bottom" effect="solid" className="screen3-tooltip" arrowColor="transparent" backgroundColor="rgba(90, 90, 90, 1)" />
    </>
  );
};

export default BackButton;
