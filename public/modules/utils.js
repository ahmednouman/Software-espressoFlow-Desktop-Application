const { exec } = require('child_process');
var path = require('path');
const find = require('find-process');

const startApp = async (name, resourcePath) => {
  const processList = await find('name', name);
  if (processList && processList.length > 0) {
    processList.forEach(proc => {
      process.kill(proc.pid, 'SIGKILL');
    });
  }
  if (process.platform === 'darwin') {
    const filePath = path.join(process.resourcesPath, resourcePath);
    exec(`open -n ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }
};

const startRistretto = async () => {
  await startApp(
    'Espresso Flow Helper',
    'flowserver/packages/Espresso Flow Helper',
  );
};

function displayType(displayName) {
  if (
    displayName.indexOf('eD15T(2022)') > -1 ||
    displayName.indexOf('eD13T(2022)') > -1 ||
    displayName.indexOf('eD13(2022)') > -1
  ) {
    return 'espresso v2';
  }

  if (displayName.indexOf('espresso') > -1) {
    return 'espresso v1';
  }

  if (
    displayName.indexOf('Color LCD') > -1 ||
    displayName.indexOf('In-built Retina Display') > -1
  ) {
    return 'laptop';
  }

  if (displayName === '') {
    return 'laptop';
  }

  return 'non-espresso';
}

function parseQuery(queryString) {
  var query = {};
  var pairs = (
    queryString[0] === '?' ? queryString.substr(1) : queryString
  ).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

module.exports = { displayType, startRistretto, parseQuery };
