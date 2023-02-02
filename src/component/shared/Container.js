import React from 'react';
import useStore from '../../store';
import BackButton from '../Window-Management/BackButton';
import HelpMenu from './help';
import ToggleSettings from './ToggleSettings';

const Container = ({ children, title }) => {
  const theme = useStore(state => state.theme);
  const history = useStore(state => state.history);
  const tabState = useStore(state => state.windowTabState);
  const workspaceState = useStore(state => state.workspaceState);

  return (
    <div
      className={`
        ${theme === 'light'
          ? 'es_inner_overlay_wrapper'
          : 'es_inner_overlay_wrapper_dark'
        }
          `}
    >
      <div className="es_drag_cont unselectable">
        {history.location.pathname === '/window-management' &&
          tabState === 'workspace' &&
          (workspaceState === 'new' || workspaceState === 'edit') && (
            <BackButton theme={theme} />
          )}
        <p
          className={theme === 'light' ? 'text-black' : 'text-white'}
          style={{ gridColumn: '1/span 3', gridRow: 1 }}
        >
          {title}
        </p>

        <ToggleSettings />
        <HelpMenu />

      </div>
      {children}
    </div>
  );
};

export default Container;
