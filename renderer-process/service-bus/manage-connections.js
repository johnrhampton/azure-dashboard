const { Map } = require('immutable');
const store = require('../../libraries/data-store');
const showSnack = require('../../libraries/snackbar');

let state = Map({
  connectionName: '',
  connectionString: '',
});

const addConnectionName = document.getElementById('add-connection-name');
const addConnectionString = document.getElementById('add-connection-string');
const saveConnectionBtn = document.getElementById('save-connection');

/**
 * [getServiceBusConnections description]
 * @return {[type]} [description]
 */
function getServiceBusConnections() {
  const sbConnections = store.get('service-bus-connections');
  return sbConnections || [];
}

/**
 * [onFieldValueChange description]
 * @param  {[type]} e [description]
 */
function onFieldValueChange(e) {
  const field = e.currentTarget.dataset.field;
  const value = e.currentTarget.value;
  state = state.set(field, value);
}

/**
 * [verifyAndSaveConnection description]
 * @param  {[type]} e [description]
 * @return {void}
 */
function verifyAndSaveConnection(e) {
  if (!state.get('connectionName') || !state.get('connectionString')) {
    return showSnack({
      message: 'Connection name and string are required!',
      type: 'warn',
    });
  }
}

/**
 * [init description]
 */
function init() {
  const serviceBusConnections = getServiceBusConnections();
  // set connection count
  document.getElementById('sb-connection-count').innerHTML = serviceBusConnections.length;
}

// bind event listeners
addConnectionName.addEventListener('input', onFieldValueChange);
addConnectionString.addEventListener('input', onFieldValueChange);
saveConnectionBtn.addEventListener('click', verifyAndSaveConnection);

init();
