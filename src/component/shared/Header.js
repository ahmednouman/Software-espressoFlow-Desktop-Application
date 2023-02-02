import React from 'react';
import { baseImagePath } from '../../utils/utility';

const Header = ({ theme }) => {
  return (
    <div className="es_logo_wrapper">
      <img
        src={
          theme === 'light'
            ? baseImagePath('icons/logo.svg')
            : baseImagePath('thumbnails/logo-white.svg')
        }
        alt="logo"
      />
    </div>
  );
};

export default Header;
