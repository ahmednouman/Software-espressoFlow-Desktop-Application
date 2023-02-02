import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import useStore from '../../store';

const NavTabs = ({ navTitles = [], tabContent = [] }) => {
  const theme = useStore(state => state.theme);
  const workspaceAppPopupSelectedTab = useStore(state => state.workspaceAppPopupSelectedTab);

  const highlight =
    theme === 'dark' ? 'rgba(86, 0, 86, 0.8)' : 'rgba(194, 240, 86, 1)';
  const textColor = theme === 'dark' ? '#DCDCDC' : 'black';

  const styles = {
    tabs: {
      width: '100%',
      marginTop: '15px',
      textAlign: 'center',
    },
    links: {
      margin: 'auto',
      width: 'fit-content',
      backgroundColor: 'rgba(208, 208, 208, 0.2)',
      borderRadius: '25px',
      padding: 2,
    },
    tabLink: {
      height: '30px',
      lineHeight: '30px',
      padding: '0 20px',
      cursor: 'pointer',
      border: 'none',
      borderBottom: '2px solid transparent',
      display: 'inline-block',
      backgroundColor: 'transparent',
      borderRadius: '25px',
      color: textColor,
    },
    activeLinkStyle: {
      backgroundColor: highlight,
      borderRadius: '25px',
    },
    visibleTabStyle: {},
    content: {
      padding: '0 15px',
    },
  };

  return (
    <Tabs
      activeLinkStyle={styles.activeLinkStyle}
      visibleTabStyle={styles.visibleTabStyle}
      style={styles.tabs}
    //onChange={handleChange}
    //selectedTab={tabState}
    >
      <div style={styles.links}>
        {navTitles.map((title, i) => {
          return (
            <TabLink
              default={i === workspaceAppPopupSelectedTab}
              key={`${title}-${i}`}
              to={title}
              style={styles.tabLink}
            >
              {title}
            </TabLink>
          );
        })}
      </div>

      <div style={styles.content}>
        {tabContent.map((content, index) => {
          return (
            <TabContent key={`content-${index}`} for={navTitles[index]}>
              {content}
            </TabContent>
          );
        })}
      </div>
    </Tabs>
  );
};

export default NavTabs;
