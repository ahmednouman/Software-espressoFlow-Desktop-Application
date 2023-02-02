import React from 'react';
import Header from '../component/shared/Header';
import Sidebar from '../component/shared/Sidebar';
import useStore from '../store';

export const PublicLayout = ({ children }) => {
  const { history } = children.props;
  const theme = useStore(state => state.theme);
  const pathname = history.location.pathname;

  return (
    <>
      {pathname !== '/screen-two' && (
        <div
          className={
            theme === 'light'
              ? 'es_side_overlay_wrapper'
              : 'es_side_overlay_wrapper_dark'
          }
        >
          {(pathname === '/screen-three' ||
            pathname.includes('window-management') ||
            pathname === '/pen') && <Sidebar theme={theme} />}
        </div>
      )}
      <div
        className={
          theme === 'light' ? 'es_main_wrapper' : 'es_main_wrapper_dark'
        }
      >

        <div className="main_area onboarding-workspace-step9">
          <Header history={history} theme={theme} />
          <div className={'es_inner_wrapper'}>{children}</div>
        </div>
      </div>
    </>
  );
};

export const NoLayout = ({ children }) => {
  return <>{children}</>;
};
