import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import Snap from './snap';
import './styles.css';
import useStore from '../../store';
import { CompositeDisposable } from 'rx';


const WindowManagementTabs = props => {
  const theme = useStore(state => state.theme);
  const tabState = useStore(state => state.windowTabState);
  const setTabState = useStore(state => state.setWindowTabState);
  const windowTabVisibilityState = useStore(state => state.windowTabVisibilityState);
  const tabVisibilityState = useStore(state => state.tabVisibilityState);
  const setWorkspaceState = useStore(state => state.setWorkspaceState);

  // console.log(props)

  const highlight =
    // theme === 'dark' ? 'rgba(86, 0, 86, 0.6)' : 'rgba(194, 240, 86, 1)';
    theme === 'dark' ? 'rgba(96, 38, 158, 1)' : 'rgba(194, 240, 86, 1)';
  const textColor = theme === 'dark' ? '#DCDCDC' : 'black';

  const styles = {
    links: {
      margin: 'auto',
      // backgroundColor: 'rgba(208, 208, 208, 0.2)',
      backgroundColor: 'rgba(48, 48, 48, 1)',
      borderRadius: '14px',
      padding: '4px',
      boxShadow: '15px 15px 20px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(4px)',
      width: 'fit-content',
    },
    tabLink: {
      height: '25px',
      width: '100px',
      // lineHeight: '25px',
      padding: '6px 10px',
      cursor: 'pointer',
      border: 'none',
      // width: '90px',
      borderBottom: '2px solid transparent',
      display: 'inline-block',
      backgroundColor: 'transparent',
      borderRadius: '10px',
      color: textColor,
    },
    activeLinkStyle: {
      backgroundColor: highlight,
      borderRadius: '10px',
    },
    visibleTabStyle: {},
  };

  const handleChange = (selectedTab, name) => {
    setTabState(selectedTab);
  };


  return (
    <div>
      <Tabs
        activeLinkStyle={styles.activeLinkStyle}
        visibleTabStyle={styles.visibleTabStyle}
        className="tabs"
        onChange={handleChange}
        selectedTab={tabState}
      >
        <div className={windowTabVisibilityState === 'hidden' ? "tabBar hidden" : "tabBar"} style={styles.links}>
          <TabLink

            to="workspace"
            style={styles.tabLink}
            onClick={() => setWorkspaceState('list')}
            className='onboarding-workspace-step4'
            default
          >
            Workspace
          </TabLink>

          <TabLink to="snap" style={styles.tabLink}>
            Snap
          </TabLink>
        </div>

        <div className="tabContent">


          <TabContent
            for="workspace"
            id="tabStyle"
            className="workspaceTab"
          >
            {props.children}
          </TabContent>

          <TabContent
            for="snap"
          >
            <Snap />
          </TabContent>

        </div>
      </Tabs>
    </div>
  );
};

export default WindowManagementTabs;
