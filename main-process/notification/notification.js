const ipc = require('electron').ipcMain;

const notifyOptions = {
  width: 350,
  height: 85,
  displayTime: 7500,
  defaultStyleContainer: {
    backgroundColor: '#181d23',
    overflow: 'hidden',
    padding: 8,
    border: '1px solid #CCC',
    fontFamily: 'Arial',
    fontSize: 18,
    position: 'relative',
    lineHeight: '15px',
    color: '#b7c5d3',
  },
  defaultStyleClose: {
    position: 'absolute',
    top: 1,
    right: 3,
    fontSize: 14,
    color: '#b7c5d3',
  },
  defaultStyleText: {
    margin: 0,
    overflow: 'hidden',
    cursor: 'default',
    color: '#b7c5d3',
  },
};

ipc.on('request-user-notification', (event, arg) => {
  const eNotify = require('electron-notify');
  eNotify.setConfig(notifyOptions);
  eNotify.notify({ title: arg.title, text: arg.text });
});
