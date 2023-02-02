import React from 'react';
import useStore from '../../store';
import { baseImagePath } from '../../utils/utility';

const PenActivate = () => {
  const theme = useStore(state => state.theme);
  //const setPenActivated = useStore(state => state.setPenActivated);
  return (
    <div className="pen-activate-screen">
      <button className="primary-btn">
        <img
          src={baseImagePath('icons/espressoPen.svg')}
          alt="touch pen to espresso"
          style={{ marginRight: '10px' }}
        />
        <span>Touch pen to espresso</span>
      </button>
      <button
        className="primary-invert"
        onClick={() => window.open('https://espres.so/products/espresso-pen')}
        style={{
          border: theme === 'light' ? '1px solid #101828' : '1px solid #FFFFFF',
          color: theme === 'light' ? '#101828' : ' #FFFFFF',
        }}
      >
        Buy espressoPen
      </button>
      <a
        className={theme === 'light' ? 'link-light' : 'link-dark'}
        href="https://support.espres.so/hc/en-us/categories/4415639113753-espressoPen"
      >
        Need help?
      </a>
    </div>
  );
};

export default PenActivate;
