import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import useStore from '../../store';

const PrimaryNavTabs = ({
  navTitles = [],
  tabContent = [],
  tabState,
  setTabState,
}) => {
  const theme = useStore(state => state.theme);

  const highlight =
    theme === 'dark' ? 'rgba(86, 0, 86, 0.6)' : 'rgba(194, 240, 86, 1)';
  const textColor = theme === 'dark' ? '#DCDCDC' : 'black';

  const styles = {
    tabs: {
      width: '100%',
      display: 'inline-block',
      marginTop: '30px',
      marginRight: '30px',
      verticalAlign: 'top',
      textAlign: 'center',
      zIndex: 10,
    },
    links: {
      margin: 'auto',
      backgroundColor: 'rgba(208, 208, 208, 0.2)',
      borderRadius: '10px',
      padding: '3.5px 15px',
      boxShadow: '15px 15px 20px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(4px)',
      width: 'fit-content',
    },
    tabLink: {
      height: '30px',
      lineHeight: '30px',
      padding: '0 20px',
      cursor: 'pointer',
      border: 'none',
      minWidth: '100px',
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
    visibleTabStyle: {
      display: 'inline-block',
    },
    content: {
      padding: '0 15px',
    },
  };

  const handleChange = (selectedTab, name) => {
    setTabState(selectedTab);
  };

  return (
    <Tabs
      activeLinkStyle={styles.activeLinkStyle}
      visibleTabStyle={styles.visibleTabStyle}
      style={styles.tabs}
      onChange={handleChange}
      selectedTab={tabState}
    >
      <div style={styles.links}>
        {navTitles.map((title, i) => {
          return (
            <TabLink
              default={i === 0}
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

export default PrimaryNavTabs;
