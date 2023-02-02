import React from 'react';

const App = () => {

  return (
    <>
      <h1>Electron with React JS!!</h1>
      <button
        onClick={() => {
          window.electron.notificationAPI.sendNotification(
            'My custom notification!',
          );
        }}
      >
        Notify
      </button>
    </>
  );
};

export default App;
