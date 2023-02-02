import React from 'react';
import AddWebPageButton from './AddWebPageButton';
import WebPageList from './WebPageList';

const WebPage = () => {
  return (
    <div className="webpage-container">
      <AddWebPageButton />
      <WebPageList />
    </div>
  );
};

export default WebPage;
