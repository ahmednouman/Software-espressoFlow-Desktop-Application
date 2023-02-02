const { app } = require('electron');
const ua = require('universal-analytics');
const { v4: uuidv4 } = require('uuid');
const Store = require('electron-store');

const store = new Store();



function gettimeUTC(){
  const start = Date.now();
  return start
}
function getCurrentTimeStamp() {
  var now = new Date();
  var tzo = -now.getTimezoneOffset();
  var dif = tzo >= 0 ? '+' : '-';
  var pad = function(num, ms) {
      var norm = Math.floor(Math.abs(num));
      if (ms) return (norm < 10 ? '00' : norm < 100 ? '0' : '') + norm;
      return (norm < 10 ? '0' : '') + norm;
  };
  return now.getFullYear() 
      + '-' + pad(now.getMonth()+1)
      + '-' + pad(now.getDate())
      + 'T' + pad(now.getHours())
      + ':' + pad(now.getMinutes()) 
      + ':' + pad(now.getSeconds())
      + '.' + pad(now.getMilliseconds(), true)
      + dif + pad(tzo / 60) 
      + ':' + pad(tzo % 60);
}


function trackEvent(action, label, value) {
  //if (app.isPackaged) 
  {
    let userId = store.get('userid');

    if (userId === undefined) {
      userId = uuidv4();
      store.set('userid', userId);
    }
    const usr = ua('UA-225194579-1', userId); //ENGINEER: UA-225461231-1 //AHMED: UA-225194579-1  // PERSONAL: UA-224928972-1
    console.log('ID = ', userId, action, label);
    console.log(userId)
    //console.log(typeof(label))
    if (typeof label != 'string') {
      label = JSON.stringify(label);
    }
    // value = gettimeUTC()
    // console.log(typeof(value))
    console.log(action, label, value);
    
    usr
      .event({
        ec: userId,
        ea: action,
        el: label,
        ev: value,
      })
      .send();
  }
}

module.exports = { trackEvent, getCurrentTimeStamp };
