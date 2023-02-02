// TO DELETE SINCE NO LONGER REQUIRED
const { app } = require('electron');
const execFile = require('child_process').execFile;
var path = require('path');
const find = require('find-process');

const kill_server = async () => {
  const processList = find('name', 'flowserver');
  if (processList.length) {
    processList.forEach(proc => {
      process.kill(proc.pid, 'SIGKILL');
    });
  }
};

const run_server = async () => {
  await kill_server();
  if (!app.isPackaged) return;
  let exePath = '';
  if (process.platform === 'darwin') {
    exePath = path.join(process.resourcesPath, 'flowserver/flowserver');
  } else {
    exePath = path.join(process.resourcesPath, 'flowserver');
  }
  let _process = execFile(exePath, {}, function (error, stderr) {
    if (error !== null) {
      console.log('exec error: ', error);
    }
  });

  console.log('launching server');
  return _process;
};
module.exports = {
  run_server,
  kill_server,
};
