const childProcess = require('child_process');

export const spawnProcess = () => {
  const path = 'bash ristretto.sh';
  childProcess.spawn(path, function (err, data) {
    if (err) {
      console.error(err);
      return;
    }
  });
};
