const { ipcRenderer: ipc } = require('electron');
const { store, keys } = require('../../libraries/data-store');

const closeConfigModal = document.getElementById('close-config-modal');
const mainConfigArea = document.getElementById('main-config-area');

const config = store.get(keys.CONFIG);

mainConfigArea.innerHTML = JSON.stringify(config, null, 2);

// handle navigation click events
closeConfigModal.addEventListener('click', () => {
  ipc.send('request-modal-close', { modal: 'config' });
});
