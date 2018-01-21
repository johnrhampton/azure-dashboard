const { ipcRenderer: ipc } = require('electron');

setTimeout(() => {
  console.log('closing');
  ipc.send('request-modal-close', { modal: 'config' });
}, 5000);
