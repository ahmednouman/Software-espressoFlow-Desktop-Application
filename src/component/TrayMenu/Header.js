import React from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store';
import { baseImagePath } from '../../utils/utility';

const TrayHeader = () => {
  const theme = useStore(state => state.theme);
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          width={14}
          height={14}
          src={baseImagePath(
            theme === 'light'
              ? 'icons/favicon16.svg'
              : 'icons/favicon16-white.svg',
          )}
          alt="espressoFlow"
        />
        <span
          style={{
            marginLeft: '1em',
            fontWeight: '700',
            fontSize: '14px',
            color: theme === 'light' ? '#5A5A5A' : '#F0F0F0',
          }}
        >
          Flow
        </span>
      </div>

      <Link
        to="#"
        style={{ cursor: 'pointer' }}
        onClick={() => window.open('https://support.espres.so', 'modal')}
      >
        <img
          height={20}
          width={20}
          src={baseImagePath(
            theme === 'light' ? 'icons/help.svg' : 'icons/help-dark.svg',
          )}
          alt="help"
        />
      </Link>
    </div>
  );
};

export default TrayHeader;
