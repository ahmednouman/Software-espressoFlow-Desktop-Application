import React, { useEffect } from 'react';
import { baseImagePath, osFinder } from '../../utils/utility';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/RouterPath';
import { SNAPPING_WALKTHROUGH } from '../../utils/utility';
import useStore from '../../store';

const Sidebar = ({ theme }) => {
  const setWindowTabState = useStore(state => state.setWindowTabState);
  const setWorkspaceState = useStore(state => state.setWorkspaceState);
  const onboarding = useStore(state => state.onboarding);
  const menuVisible = useStore(state => state.menuVisible);
  const setMenuVisible = useStore(state => state.setMenuVisible);
  //const handleToolTip = useStore(state => state.setToolTip);
  const history = useStore(state => state.history);
  const activeNav = useStore(state => state.activeNav);
  const setActiveNav = useStore(state => state.setActiveNav);
  const setStepIndex = useStore(state => state.setWorkspaceOnboardingStep);
  const setSidebarWalkthrough = useStore(state => state.setSidebarWalkthrough);
  const setDisplayWalkthrough = useStore(state => state.setDisplayWalkthrough);
  const flowWindowPermissions = useStore(state => state.flowWindowPermissions);
  const startSidebarWalkthrough = useStore(
    state => state.startSidebarWalkthrough,
  );
  const startDisplayWalkthrough = useStore(
    state => state.startDisplayWalkthrough,
  );
  const startWorkspaceWalkthrough = useStore(
    state => state.startWorkspaceWalkthrough,
  );
  const espressoFound = useStore(state => state.espressoFound);
  const nonEspressoFound = useStore(state => state.nonEspressoFound);
  const setShowNoEspressoModal = useStore(
    state => state.setShowNoEspressoModal,
  );
  const setWorkspaceWalkthrough = useStore(
    state => state.setWorkspaceWalkthrough,
  );



  useEffect(() => {
    if (
      !onboarding.initial &&
      !startDisplayWalkthrough &&
      !startWorkspaceWalkthrough
    ) {
      if (!menuVisible) {
        setMenuVisible(true);
      }

      setTimeout(() => {
        setSidebarWalkthrough(true);
      }, 200);
    } else {
      if (menuVisible) {
        setMenuVisible(false);
      }
      setSidebarWalkthrough(false);
    }
  }, [onboarding]);

  useEffect(() => {
    if (history && history.location?.pathname) {
      setActiveNav(history.location.pathname);
    }
  }, [history, setActiveNav]);

  const resetWorkspaceState = () => {
    setWindowTabState('workspace');
    setWorkspaceState('list');
  };

  const handleArrangementClick = event => {
    setMenuVisible(false);
    history.push(ROUTES.SCREEN_THREE_PATH);
    setActiveNav(history.location.pathname);
  };

  const handleWorkspaceClick = event => {
    setMenuVisible(false);
    if (osFinder("Mac")) {
      if (!onboarding.workspace && flowWindowPermissions) {
        setSidebarWalkthrough(false);
        setStepIndex(SNAPPING_WALKTHROUGH.START);
        setWorkspaceWalkthrough(true);
        setActiveNav(history.location.pathname);
      }
    } else {
      if (!onboarding.workspace) {
        setSidebarWalkthrough(false);
        setStepIndex(SNAPPING_WALKTHROUGH.START);
        setWorkspaceWalkthrough(true);
        setActiveNav(history.location.pathname);
      }

    }

  };

  const startDisplayWalkthroughFunc = () => {
    setSidebarWalkthrough(false);

    history.push(ROUTES.SCREEN_THREE_PATH);

    if (
      !espressoFound.found &&
      !nonEspressoFound.found &&
      !onboarding.display
    ) {
      setShowNoEspressoModal(true);
      return;
    }

    if (!onboarding.display) {
      setSidebarWalkthrough(false);
      setDisplayWalkthrough(true);
    }
  };

  return (
    <div
      className="es_sidebar_wrapper"
      style={{
        width: menuVisible ? '230px' : '70px',
        backgroundColor:
          menuVisible && theme === 'dark' && 'rgba(0, 0, 0, 0.5)',
        background:
          menuVisible &&
          theme === 'light' &&
          'linear-gradient(350.59deg, #4EA00D 5.73%, rgba(204, 255, 51, 0.376727) 50.02%, rgba(204, 255, 51, 0) 79.28%)',
        filter: menuVisible && 'drop-shadow(15px 15px 20px rgba(0, 0, 0, 0.1))',
        backdropFilter: menuVisible && 'blur(4px)',
        transition: 'all 0.15s ease-in-out',
      }}
    >
      <ul className="sidebar_ul">
        <li className="sidebar_arrow" style={{paddingLeft: '10px'}}>
          <img
            height="20px"
            width="20px"
            style={{
              cursor: 'pointer',
              transform: menuVisible ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            src={baseImagePath(
              theme === 'light'
                ? 'icons/right-arrow-large.svg'
                : 'icons/right-arrow-large-white.svg',
            )}
            alt="toggle menu"
            onClick={() => {
              if (startSidebarWalkthrough) {
                setSidebarWalkthrough(false);
              }

              setMenuVisible(!menuVisible);
            }}
            className="menu-arrow"
          />
        </li>
        <li
          className="sidebar_li arrangement-nav"
          onClick={() => handleArrangementClick()}
          style={{
            backgroundColor:
              activeNav === '/screen-three' && theme === 'light'
                ? '#C2F056'
                : activeNav === '/screen-three'
                  // ? 'rgba(86, 0, 86, 1.0)'
                  ? 'rgba(96, 38, 158, 1)'
                  : '',
          }}
        >
          <Link
            to={ROUTES.SCREEN_THREE_PATH}
            onClick={startDisplayWalkthroughFunc}
          >
            <div className="sidebar_nav_icon_container">
              <img
                src={
                  theme === 'light'
                    ? baseImagePath('icons/productivity_icon.svg')
                    : baseImagePath('icons/productivity_icon_light.svg')
                }
                className="sidebar_img"
                alt="arrangement icon"
                style={{paddingLeft: "2px"}}
              />
              {!onboarding.display && (
                <div className="purple-dot fade-in-300ms"></div>
              )}
            </div>

            {menuVisible && (
              <span
                className="sidebar_nav_text"
                style={{ width: '170px', color: theme === 'light' ? '#303030' : '#FFFFFF' }}
              >
                Arrange displays
              </span>
            )}
          </Link>
        </li>

        <li
          className="sidebar_li workspace-nav"
          onClick={e => handleWorkspaceClick(e)}
          style={{
            backgroundColor:
              activeNav === '/window-management' && theme === 'light'
                ? '#C2F056'
                : activeNav === '/window-management'
                  // ? 'rgba(86, 0, 86, 1.0)'
                  ? 'rgba(96, 38, 158, 1)'
                  : '',
          }}
        >
          <Link to={ROUTES.WINDOW_MANAGEMENT} onClick={resetWorkspaceState}>
            <div className="sidebar_nav_icon_container">
              <img
                src={
                  theme === 'light'
                    ? baseImagePath('icons/workspace_icon.svg')
                    : baseImagePath('icons/workspace_icon_light.svg')
                }
                className="sidebar_img"
                alt="workspace icon"
                style={{ width: '27px', paddingLeft: "2px" }}
              />
              {!onboarding.workspace && (
                <div className="purple-dot fade-in-600ms"></div>
              )}
            </div>

            {menuVisible && (
              <span
                className="sidebar_nav_text"
                style={{ width: '170px', color: theme === 'light' ? '#303030' : '#FFFFFF' }}
                onClick={handleWorkspaceClick}
              >
                Manage workspaces
              </span>
            )}
          </Link>
        </li>

        {/* <li className="sidebar_li" onClick={() => closeTooltip()} style={{
          backgroundColor: activeNav === "/pen" && theme === 'light' ? "#C2F056" : activeNav === '/pen' ? "rgba(86, 0, 86, 1.0)" : ""
        }}>
          <Link to={onboarding.initial ? ROUTES.PEN : "#"}>
            <div className="sidebar_nav_icon_container">
              <img
                src={
                  theme === 'light'
                    ? baseImagePath('icons/pen_icon.svg')
                    : baseImagePath('icons/pen_icon_light.svg')
                }
                className="sidebar_img"
                alt="pen icon"
              />
              {!onboarding.pen && <div className="purple-dot fade-in-600ms"></div>}
            </div>
            {menuVisible && (
              <span
                className="sidebar_nav_text"
                style={{ color: theme === 'light' ? '#303030' : '#FFFFFF' }}
              >
                Customise pen
              </span>
            )}
          </Link>
        </li> */}
      </ul>
    </div>
  );
};

export default Sidebar;
