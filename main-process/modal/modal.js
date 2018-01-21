const { ipcMain: ipc, BrowserWindow } = require('electron');
const path = require('path');

const modals = new Map();

// event listener for modal open
ipc.on('request-modal-open', (event, arg) => {
  const { modal } = arg;
  // get the main window to set as parent
  const mainWindow = BrowserWindow.fromId(1);
  // create child window
  const child = new BrowserWindow({ parent: mainWindow, modal: true, show: false });
  child.loadURL(path.join('file://', __dirname, '../', '../', 'modals', modal, '/index.html'));
  child.once('ready-to-show', () => {
    child.show();
  });

  // store modal id in Set
  modals.set(modal, child.id.toString());
});

// eventl listener for modal close
ipc.on('request-modal-close', (event, arg) => {
  const { modal } = arg;
  const modalId = modals.get(modal);
  if (modalId) {
    const modalToClose = BrowserWindow.fromId(Number(modalId));
    modalToClose.close();
    modals.delete(modalId);
  }
});
